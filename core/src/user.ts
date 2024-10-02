import { ReadTransaction } from "replicache";
import { z } from "zod";
import { Mutations } from "./utils";

export module User {
  export const Info = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    type: z.enum(["admin", "operator"]),
    password: z.string(),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `U-${Math.floor(Math.random() * 100000000)}`;

  export const mutations = new Mutations()
    .register(
      "insertUser",
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        type: z.enum(["admin", "operator"]),
        password: z.string(),
      }),
      async (tx, input) => {
        await tx.set(`users/${input.id}`, {
          email: input.email,
          name: input.name,
          userId: input.id,
          type: input.type,
          password: input.password,
        } satisfies Info);
      },
    )

    .register(
      "changePassword",
      z.object({
        userId: z.string(),
        newPassword: z
          .string()
          .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%&])[A-Za-z\d@$%#&]{6,}$/),
      }),
      async (tx, input) => {
        const existing = await tx.get<Info>(`users/${input.userId}`);
        if (!existing) {
          throw new Error("User not found");
        }

        await tx.set(`users/${input.userId}`, {
          ...existing,
          password: input.newPassword,
        });
      },
    )

    .register("deleteUser", z.string(), async (tx, input) => {
      await tx.del(`users/${input}`);
    });

  export const queries = {
    getAllUsers: async (tx: ReadTransaction) => {
      const users = await tx
        .scan<User.Info>({
          prefix: "users",
        })
        .values()
        .toArray();

      return users;
    },

    singleUser: async (tx: ReadTransaction, userId: string) => {
      const user = await tx.get<User.Info>(`users/${userId}`);
      return user;
    },
  };
}
