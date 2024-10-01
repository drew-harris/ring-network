import { PatchOperation } from "replicache";
import { Transaction } from "../../db";
import { User_TB } from "../../schema";
import { gt } from "drizzle-orm";
import { User } from "core/user";

export const getChangedUsers = async (
  tx: Transaction,
  fromVersion: number,
): Promise<PatchOperation[]> => {
  const users = await tx
    .select()
    .from(User_TB)
    .where(gt(User_TB.version, fromVersion));

  const ops = users.map((row) => {
    if (row.deleted) {
      return {
        op: "del",
        key: `users/${row.userId}`,
      } satisfies PatchOperation;
    }
    return {
      op: "put",
      key: `users/${row.userId}`,
      value: {
        email: row.email,
        name: row.name,
        userId: row.userId,
      } satisfies User.Info,
    } satisfies PatchOperation;
  });

  return ops;
};
