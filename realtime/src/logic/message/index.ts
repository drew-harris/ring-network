import { ServerMutations } from "../../server-mutation";
import { Message_TB, Node_TB } from "../../schema";
import { eq, inArray } from "drizzle-orm";
import { Transaction } from "../../db";
import { Message } from "core/message";
import { getNodeById } from "../node";

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
    const node = await getNodeById(tx, input.reciverId);
    if (!node || node.status === "inactive") {
      await tx.insert(Message_TB).values([
        {
          ...input,
          path: [input.senderId, input.reciverId],
          status: "Undelivered",
          placement: "undelivered",
          seen: false,
          version: version,
          deleted: false,
        },
      ]);
    } else {
      await tx.insert(Message_TB).values([
        {
          ...input,
          path: [input.senderId, input.reciverId],
          status: "Delivered",
          placement: "node",
          seen: false,
          version: version,
          deleted: false,
        },
      ]);
    }
  },

  archiveMessages: async (tx, input, version) => {
    await tx
      .update(Message_TB)
      .set({
        placement: "archive",
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
