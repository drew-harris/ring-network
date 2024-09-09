import { Mutations, query } from "./utils";
import { z } from "./zod";

export module Message {
  export const Info = z.object({
    messageId: z.string(),
    senderId: z.string(),
    reciverId: z.string(),
    message: z.string(),
    createdAt: z.string(),
    receivedAt: z.string(),
    direction: z.enum(["left", "right"]),
    path: z.array(z.string()),
    status: z.enum(["Created", "Delivered"]), // TODO: Update
  });

  export type Info = z.infer<typeof Info>;

  export const mutations = new Mutations()
    .register(
      "sendMessage",
      z.object({
        messageId: z.string(),
        senderId: z.string(),
        reciverId: z.string(),
        message: z.string(),
      }),
      async (tx, input) => {
        return await tx.set(`messages/${input.messageId}`, {
          ...input,
          createdAt: new Date().toISOString(),
          direction: "left",
          path: [input.senderId, input.reciverId],
          receivedAt: new Date().toISOString(),
          status: "Delivered",
        } satisfies Info);
      },
    )
    .register("deleteMessage", z.string(), async (tx, input) => {
      return await tx.del(`messages/${input}`);
    })
    .register("bulkDeleteMessages", z.array(z.string()), async (tx, input) => {
      for (const messageId of input) {
        await tx.del(`messages/${messageId}`);
      }
    });

  export const queries = {
    // Get messages for a node by reciverId
    getMessagesForNode: query(z.string(), async (tx, input) => {
      const messages = await tx
        .scan<Message.Info>({
          prefix: `messages/`,
        })
        .values()
        .toArray();
      return messages.filter((message) => message.reciverId === input);
    }),

    getAllMessages: query(z.void(), async (tx) => {
      const messages = await tx
        .scan<Message.Info>({
          prefix: `messages/`,
        })
        .values()
        .toArray();
      return messages;
    }),
  };
}
