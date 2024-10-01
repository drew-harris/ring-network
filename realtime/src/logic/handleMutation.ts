import { MutationV1 } from "replicache";
import { Transaction } from "../db";
import { nodeServerMutations } from "./node";
import { messageServerMutations } from "./message";
import { userServerMutations } from "./user";

const allMutations = {
  ...nodeServerMutations,
  ...messageServerMutations,
  ...userServerMutations,
};

export const handleMutation = async (
  mutation: MutationV1,
  tx: Transaction,
  nextVersion: number,
) => {
  // @ts-expect-error
  const possibleHandler = allMutations[mutation.name];
  if (possibleHandler) {
    return await possibleHandler(tx, mutation.args, nextVersion);
  } else {
    throw new Error(`Unknown mutation ${mutation.name}`);
  }
};
