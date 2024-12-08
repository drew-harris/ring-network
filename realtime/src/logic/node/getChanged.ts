import { PatchOperation } from "replicache";
import { Node } from "core/node";
import { Transaction } from "../../db";
import { Node_TB } from "../../schema";
import { gt } from "drizzle-orm";

export const getChangedNodes = async (
  tx: Transaction,
  fromVersion: number,
): Promise<PatchOperation[]> => {
  const nodes = await tx
    .select()
    .from(Node_TB)
    .where(gt(Node_TB.version, fromVersion));

  const ops = nodes.map((row) => {
    if (row.deleted) {
      return {
        op: "del",
        key: `nodes/${row.nodeId}`,
      } satisfies PatchOperation;
    }
    return {
      op: "put",
      key: `nodes/${row.nodeId}`,
      value: {
        label: row.label,
        leftNeighbor: row.leftNeighbor,
        nodeId: row.nodeId,
        rightNeighbor: row.rightNeighbor,
        inboxSize: row.inboxSize,
        status: row.status,
      } satisfies Node.Info,
    } satisfies PatchOperation;
  });

  return ops;
};
