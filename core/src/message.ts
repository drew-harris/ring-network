import { ReadTransaction, Replicache } from "replicache";
import { Mutations, query } from "./utils";
import { z } from "./zod";

const placementSchema = z.enum(["node", "system-buffer", "undelivered"]);

export module Message {
  export type FailureReason = "InboxFull" | "NodeInactive" | "NodeNotFound";

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
    status: z.enum([
      "Created",
      "OnRoute",
      "Delivered",
      "NotDelivered-InboxFull",
      "NotDelivered-NodeInactive",
      "NotDelivered-NodeNotFound",
    ]), // TODO: Update
    seen: z.boolean(),
    placement: placementSchema,
  });

  export type Info = z.infer<typeof Info>;

  export const getById = async (
    tx: Replicache,
    messageId: string,
  ): Promise<Info | undefined> => {
    const message = await tx.query(async (tx) => {
      const message = await tx.get<Info>(`messages/${messageId}`);
      return message as Info | undefined;
    });
    return message;
  };

  export const schemas = {
    createMessage: z.object({
      messageId: z.string(),
      createdAt: z.string(),
      receivedAt: z.string(),
      label: z.string(),
      senderId: z.string(),
      reciverId: z.string(),
      message: z.string(),
      direction: z.enum(["left", "right"]),
    }),
  };

  export const mutations = new Mutations()
    .register("sendMessage", schemas.createMessage, async (tx, input) => {
      // Check to see if the reciver is online and active
      return await tx.set(`messages/${input.messageId}`, {
        ...input,
        direction: input.direction,
        path: [input.senderId],
        status: "Delivered",
        placement: "node",
        seen: false,
      } satisfies Info);
    })

    .register(
      "failSend",
      z.object({
        messageId: z.string(),
        reason: z.enum(["InboxFull", "NodeInactive", "NodeNotFound"]),
      }),
      async (tx, input) => {
        const currentMessage = (await tx.get<Info>(
          `messages/${input.messageId}`,
        )) as Info | undefined;
        if (!currentMessage) {
          return;
        }
        await tx.del(`in_flight/${input.messageId}`);
        return await tx.set(`messages/${input.messageId}`, {
          ...currentMessage,
          placement: "system-buffer",
          status: `NotDelivered-${input.reason}`,
        } satisfies Info);
      },
    )

    .register(
      "pushPath",
      z.object({
        messageId: z.string(),
        newPosition: z.string(),
      }),
      async (tx, input) => {
        const currentMessage = (await tx.get<Info>(
          `messages/${input.messageId}`,
        )) as Info | undefined;
        if (!currentMessage) {
          return;
        }
        return await tx.set(`messages/${input}`, {
          ...currentMessage,
          path: [...currentMessage.path, input.newPosition],
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
        const currentMessage = (await tx.get<Info>(`messages/${messageId}`)) as
          | Info
          | undefined;
        if (!currentMessage) {
          return;
        }
        await tx.set(`messages/${messageId}`, {
          ...currentMessage,
          placement: "system-buffer",
        } satisfies Info);
      }
    })
    .register("markMessageAsSeen", z.string(), async (tx, input) => {
      const currentMessage = (await tx.get<Message.Info>(
        `messages/${input}`,
      )) as Info | undefined;
      if (!currentMessage) {
        return;
      }
      await tx.set(`messages/${input}`, {
        ...currentMessage,
        seen: true,
      } satisfies Info);
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
