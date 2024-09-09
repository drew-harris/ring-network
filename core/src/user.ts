import { ReadTransaction } from "replicache";
import { z } from "zod";
import { Mutations } from "./utils";

export module User {
  export const Info = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `U-${Math.floor(Math.random() * 100000000)}`;

  export const mutations = new Mutations()
    .register(
      "insertUser",
      z.object({ name: z.string(), email: z.string() }),
      async (tx, input) => {
        const userId = createId();
        await tx.set(`users/${userId}`, {
          email: input.email,
          name: input.name,
          userId,
        } satisfies Info);
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
