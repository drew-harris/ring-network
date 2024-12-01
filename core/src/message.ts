import { Mutations, query } from "./utils";
import { Node } from "./node";
import { z } from "./zod";

const placementSchema = z.enum(["node", "archive", "undelivered"]);

export module Message {
  export const Info = z.object({
    messageId: z.string(),
    label: z.string(),
    senderId: z.string(),
    reciverId: z.string(),
    message: z.string(),
    createdAt: z.string(),
    receivedAt: z.string().nullable(),
    direction: z.enum(["left", "right"]),
    path: z.array(z.string()),
    status: z.enum(["Created", "Delivered", "Undelivered"]), // TODO: Update
    seen: z.boolean(),
    placement: placementSchema,
  });

  export type Info = z.infer<typeof Info>;

  export const mutations = new Mutations()
    .register(
      "sendMessage",
      z.object({
        messageId: z.string(),
        createdAt: z.string(),
        receivedAt: z.string(),
        label: z.string(),
        senderId: z.string(),
        reciverId: z.string(),
        message: z.string(),
        direction: z.enum(["left", "right"]),
      }),
      async (tx, input) => {
        // Check to see if the reciver is online and active
        const reciverNode = await tx.get<Node.Info>(`nodes/${input.reciverId}`);

        if (!reciverNode || reciverNode.status === "inactive") {
          return await tx.set(`messages/${input.messageId}`, {
            ...input,
            direction: input.direction,
            path: [input.senderId, input.reciverId],
            status: "Undelivered",
            placement: "undelivered",
            seen: false,
          } satisfies Info);
        }

        return await tx.set(`messages/${input.messageId}`, {
          ...input,
          direction: input.direction,
          path: [input.senderId, input.reciverId],
          status: "Delivered",
          placement: "node",
          seen: false,
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
    })
    .register("archiveMessages", z.array(z.string()), async (tx, input) => {
      for (const messageId of input) {
        const currentMessage = await tx.get<Message.Info>(
          `messages/${messageId}`,
        );
        await tx.set(`messages/${messageId}`, {
          ...currentMessage,
          placement: "archive",
        });
      }
    })
    .register("markMessageAsSeen", z.string(), async (tx, input) => {
      const currentMessage = await tx.get<Message.Info>(`messages/${input}`);
      await tx.set(`messages/${input}`, {
        ...currentMessage,
        seen: true,
      });
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

    getAllMessages: query(placementSchema, async (tx, input) => {
      const messages = await tx
        .scan<Message.Info>({
          prefix: `messages/`,
        })
        .values()
        .toArray();
      return messages.filter((message) => message.placement === input);
    }),
  };

  export const generateMessageId = () => {
    // Random number from 1-100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    return `M-${randomNumber}`;
  };
}
