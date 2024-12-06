import { ServerMutations } from "../../server-mutation";
import { InFlight_TB, Message_TB } from "../../schema";
import { eq, inArray, sql } from "drizzle-orm";
import { Transaction } from "../../db";
import { Message } from "core/message";

const getMessageById = async (tx: Transaction, messageId: string) => {
  const message = await tx
    .select()
    .from(Message_TB)
    .where(eq(Message_TB, messageId))
    .then((a) => a.at(0));

  if (!message) {
    return null;
  }

  return message;
};

export const messageServerMutations: ServerMutations<
  (typeof Message)["mutations"]
> = {
  sendMessage: async (tx, input, version) => {
    await tx.insert(Message_TB).values([
      {
        ...input,
        path: [input.senderId, input.reciverId],
        status: "Created",
        receivedAt: null,
        placement: "node",
        seen: false,
        version: version,
        deleted: false,
      },
    ]);
  },

  failSend: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({
        placement: "system-buffer",
        status: `NotDelivered-${input.reason}`,
        version,
      })
      .where(eq(Message_TB.messageId, input.messageId));

    await tx
      .delete(InFlight_TB)
      .where(eq(InFlight_TB.messageId, input.messageId));
  },

  pushPath: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({
        path: sql`array_append(${Message_TB.path}, ${input})`,
        version,
      })
      .where(eq(Message_TB.messageId, input));
  },

  archiveMessages: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({
        placement: "system-buffer",
        version,
      })
      .where(inArray(Message_TB.messageId, input));
  },

  bulkDeleteMessages: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({ deleted: true, version })
      .where(inArray(Message_TB.messageId, input));
  },

  deleteMessage: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({ deleted: true, version })
      .where(eq(Message_TB.messageId, input));
  },

  markMessageAsSeen: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({ seen: true, version: version })
      .where(eq(Message_TB.messageId, input));
  },
};
