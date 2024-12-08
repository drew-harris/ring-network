import { z, ZodSchema } from "core/zod";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createTransport } from "nodemailer";
import { eq } from "drizzle-orm";
import { createTransaction } from "./db";
import { customAlphabet } from "nanoid";
import { Auth_TB, User_TB } from "./schema";
import { User } from "core/user";

const transporter = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dsharris10@gmail.com",
    pass: process.env.APP_PASSWORD!,
  },
});

type ParseType = "json" | "param" | "query";

const validate = <T extends ZodSchema, Z extends ParseType>(
  type: Z,
  schema: T,
) => {
  return validator(type, (value, ctx): z.infer<T> => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return ctx.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        400,
      );
    } else {
      return result.data;
    }
  });
};

const authRouter = new Hono()
  .post(
    "/login",
    validate(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    ),
    async (c) => {
      const { username, password } = c.req.valid("json");

      const [auth] = await createTransaction((t) => {
        return t.select().from(Auth_TB).where(eq(Auth_TB.userId, username));
      });

      if (!auth) {
        return c.json({ error: "Invalid username or password" }, 401);
      }

      if (auth.password !== password) {
        return c.json({ error: "Invalid username or password" }, 401);
      }

      const user = await createTransaction(async (t) => {
        const [user] = await t
          .select()
          .from(User_TB)
          .where(eq(User_TB.userId, username));

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      });

      return c.json({ auth, user }, 200);
    },
  )
  .get("/users", async (c) => {
    const users = await createTransaction(async (t) => {
      return t.select().from(User_TB);
    });
    return c.json(users);
  })

  .put(
    "/user",
    validate(
      "json",
      z.object({
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        type: z.enum(["admin", "operator"]),
      }),
    ),
    async (c) => {
      const data = c.req.valid("json");
      const username = User.createUsername(data.firstName, data.lastName);
      const password = User.generatePassword();
      const result = await createTransaction(async (t) => {
        const [user] = await t
          .insert(User_TB)
          .values([
            {
              email: data.email,
              name: `${data.firstName} ${data.lastName}`,
              type: data.type,
              userId: username,
            },
          ])
          .returning();

        const [auth] = await t
          .insert(Auth_TB)
          .values([
            {
              userId: username,
              password: password,
            },
          ])
          .returning();

        return { user, auth };
      });

      const frontendUrl = process.env.FRONTEND_URL!;

      await transporter.sendMail({
        from: "dsharris10@gmail.com",
        to: data.email,
        subject: "Ring Network Reset Code",
        text: `Welcome to the ring network!!!!
Your username is ${username}
Your current password is ${password}

Visit ${frontendUrl} to reset your password.
`,
      });
      return c.json(result);
    },
  )
  // Delete by username
  .delete(
    "/user",
    validate("json", z.object({ username: z.string() })),
    async (c) => {
      const data = c.req.valid("json").username;
      const result = await createTransaction(async (t) => {
        const [user] = await t
          .select()
          .from(User_TB)
          .where(eq(User_TB.userId, data));

        if (!user) {
          throw new Error("User not found");
        }

        await t.delete(User_TB).where(eq(User_TB.userId, data));
        return user;
      });

      return c.json(result);
    },
  )
  .post(
    "/reset",
    validate(
      "json",
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const [result] = await createTransaction(async (t) =>
        t
          .update(Auth_TB)
          .set({
            hasReset: true,
            password: body.password,
          })
          .where(eq(Auth_TB.userId, body.username))
          .returning(),
      );

      return c.json(result);
    },
  );

export { authRouter };

export type AuthRouterType = typeof authRouter;
