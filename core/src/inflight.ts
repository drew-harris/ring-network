import { z } from "zod";
import { Mutations } from "./utils";
import { ReadTransaction } from "replicache";

export module InFlight {
  export const Info = z.object({
    messageId: z.string(),
    position: z.string(),
    color: z.string().nullable(),
  });

  export type Info = z.infer<typeof Info>;

  export const mutations = new Mutations()
    .register(
      "createInFlight",
      z.object({
        messageId: z.string(),
        position: z.string(),
        color: z.string().nullable(),
      }),
      async (tx, input) => {
        return await tx.set(`in_flight/${input.messageId}`, {
          ...input,
        });
      },
    )
    .register(
      "moveInFlight",
      z.object({ messageId: z.string(), position: z.string() }),
      async (tx, input) => {
        return await tx.set(`in_flight/${input.messageId}`, {
          position: input.position,
        });
      },
    )
    .register(
      "deleteInFlight",
      z.object({ messageId: z.string() }),
      async (tx, input) => {
        return await tx.del(`in_flight/${input.messageId}`);
      },
    );

  export const queries = {
    // Get messages for a node by reciverId
    getAll: async (tx: ReadTransaction) => {
      const messages = await tx
        .scan<Info>({
          prefix: "in_flight",
        })
        .values()
        .toArray();
      return messages;
    },
  };
}
