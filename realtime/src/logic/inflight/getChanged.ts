import { PatchOperation } from "replicache";
import { Transaction } from "../../db";
import { InFlight_TB } from "../../schema";
import { gt } from "drizzle-orm";
import { InFlight } from "core/inflight";

export const getChangedInflight = async (
  tx: Transaction,
  fromVersion: number,
): Promise<PatchOperation[]> => {
  const flights = await tx
    .select()
    .from(InFlight_TB)
    .where(gt(InFlight_TB.version, fromVersion));

  const ops = flights.map((row) => {
    if (row.deleted) {
      return {
        op: "del",
        key: `in_flight/${row.messageId}`,
      } satisfies PatchOperation;
    }
    return {
      op: "put",
      key: `in_flight/${row.messageId}`,
      value: {
        color: row.color,
        messageId: row.messageId,
        position: row.position,
      } satisfies InFlight.Info,
    } satisfies PatchOperation;
  });

  return ops;
};
