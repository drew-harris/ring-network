import { ServerMutations } from "../../server-mutation";
import { User_TB } from "../../schema";
import { eq } from "drizzle-orm";
import { User } from "core/user";

export const userServerMutations: ServerMutations<(typeof User)["mutations"]> =
  {
    deleteUser: async (tx, input, version) => {
      await tx
        .update(User_TB)
        .set({
          version,
          deleted: true,
        })
        .where(eq(User_TB.userId, input));
    },

    changePassword: async (tx, input, version) => {
      await tx
        .update(User_TB)
        .set({
          version,
          password: input.newPassword,
        })
        .where(eq(User_TB.userId, input.userId));
    },

    insertUser: async (tx, input, version) => {
      await tx.insert(User_TB).values([
        {
          version,
          userId: input.id,
          ...input,
        },
      ]);
    },
  };
