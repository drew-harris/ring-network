import { PatchOperation } from "replicache";
import { Transaction } from "../../db";
import { Message_TB } from "../../schema";
import { gt } from "drizzle-orm";
import { Message } from "core/message";

export const getChangedMessages = async (
  tx: Transaction,
  fromVersion: number,
): Promise<PatchOperation[]> => {
  const messages = await tx
    .select()
    .from(Message_TB)
    .where(gt(Message_TB.version, fromVersion));

  const ops = messages.map((row) => {
    if (row.deleted) {
      return {
        op: "del",
        key: `messages/${row.messageId}`,
      } satisfies PatchOperation;
    }
    return {
      op: "put",
      key: `messages/${row.messageId}`,
      value: {
        label: row.label,
        messageId: row.messageId,
        createdAt: row.createdAt,
        direction: row.direction,
        message: row.message,
        path: row.path,
        placement: row.placement,
        receivedAt: row.receivedAt,
        reciverId: row.reciverId,
        seen: row.seen,
        senderId: row.senderId,
        status: row.status,
      } satisfies Message.Info,
    } satisfies PatchOperation;
  });

  return ops;
};
