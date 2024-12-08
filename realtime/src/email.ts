import { z, ZodSchema } from "core/zod";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createTransport } from "nodemailer";
import { eq } from "drizzle-orm";
import { createTransaction } from "./db";
import { customAlphabet } from "nanoid";
import { ResetCode_TB, User_TB } from "./schema";

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

const confirmSchema = z.object({
  email: z.string().email(),
});
const codeGenerator = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwyxz",
  10,
);

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
  .post("/email", validate("json", confirmSchema), async (c) => {
    const result = await createTransaction(async (tx) => {
      const data = c.req.valid("json");

      const code = codeGenerator();

      const [codeRow] = await tx
        .insert(ResetCode_TB)
        .values([
          {
            code,
            email: data.email,
          },
        ])
        .returning();
      // Create a code and send an email

      const [user] = await tx
        .select()
        .from(User_TB)
        .where(eq(User_TB.email, data.email));
      if (!user) {
        throw new Error("User not found");
      }

      const frontendUrl = process.env.FRONTEND_URL!;

      transporter.sendMail({
        from: "dsharris10@gmail.com",
        to: data.email,
        subject: "Ring Network Reset Code",
        text: `Your Ring Network reset code is ${code}
Your current password is ${codeGenerator()}

Visit ${frontendUrl}/reset?code=${code} to reset your password.
`,
      });

      return code;
    });

    return c.json({ code: result });
  })
  .get(
    "/code",
    validate("query", z.object({ code: z.string() })),
    async (c) => {
      const data = c.req.query("code");
      if (!data) {
        throw new Error("Code not found");
      }
      const code = await createTransaction(async (tx) => {
        const [code] = await tx
          .select()
          .from(ResetCode_TB)
          .where(eq(ResetCode_TB.code, data));

        if (!code) {
          throw new Error("Code not found");
        }

        return code;
      });

      return c.json({ code });
    },
  );

export { authRouter };

export type AuthRouterType = typeof authRouter;
