import { createTransaction, TxOrDb } from "./db";
import { Message_TB, Node_TB, User_TB } from "./schema";
import { getServerVersion, updateServerVersion } from "./sync-utils";

export const forceResync = async () => {
  return await createTransaction(async (t) => {
    const { version: prevVersion } = await getServerVersion(t);
    const nextVersion = prevVersion + 1;

    await t.update(Node_TB).set({
      version: nextVersion,
    });

    await t.update(Message_TB).set({
      version: nextVersion,
    });

    await t.update(Message_TB).set({
      version: nextVersion,
    });

    await updateServerVersion(t, nextVersion);
  });
};
