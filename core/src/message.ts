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
    // TODO: Add status
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
          path: [],
          receivedAt: new Date().toISOString(),
        } satisfies Info);
      },
    )
    .register("blank", z.null(), () => {
      return "good work drew";
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
      console.log(messages);
      return messages.filter((message) => message.reciverId === input);
    }),
  };
}
