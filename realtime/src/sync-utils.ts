import { Node } from "core/node";
import { Transaction } from "./db";
import {
  Auth_TB,
  Client_TB,
  InFlight_TB,
  Message_TB,
  Node_TB,
  Server_TB,
  User_TB,
} from "./schema";
import { MutationV1 } from "replicache";
import { and, eq, gt } from "drizzle-orm";
import { handleMutation } from "./logic/handleMutation";

export const getLastMutationIdChanges = async (
  tx: Transaction,
  clientGroupID: string,
  fromVersion: number,
) => {
  const result = await tx
    .select()
    .from(Client_TB)
    .where(
      and(
        eq(Client_TB.clientGroup, clientGroupID),
        gt(Client_TB.version, fromVersion),
      ),
    );

  return Object.fromEntries(
    result.map((row) => {
      return [row.id, row.lastMutation];
    }),
  );
};

export const getServerVersion = async (tx: Transaction) => {
  const result = await tx
    .select()
    .from(Server_TB)
    .then((r) => r.at(0));
  if (!result) {
    throw new Error("Server not found");
  }
  return result;
};

export const updateServerVersion = async (tx: Transaction, version: number) => {
  const result = await tx
    .update(Server_TB)
    .set({
      version,
    })
    .returning();

  if (result.length === 0) {
    await tx.insert(Server_TB).values({
      id: "server",
      version,
    });
  }
};

export const getLastMutationId = async (tx: Transaction, clientId: string) => {
  const result = await tx
    .select()
    .from(Client_TB)
    .where(eq(Client_TB.id, clientId))
    .then((r) => r.at(0));
  if (!result) {
    return 0;
  }
  return result.lastMutation;
};

export const setLastMutationId = async (
  t: Transaction,
  clientID: string,
  clientGroupID: string,
  mutationID: number,
  version: number,
) => {
  const result = await t
    .update(Client_TB)
    .set({
      clientGroup: clientGroupID,
      lastMutation: mutationID,
      version,
    })
    .where(eq(Client_TB.id, clientID))
    .returning();

  if (result.length === 0) {
    await t.insert(Client_TB).values({
      id: clientID,
      clientGroup: clientGroupID,
      lastMutation: mutationID,
      version,
    });
  }
};

export const processMutation = async (
  t: Transaction,
  groupId: string,
  mutation: MutationV1,
  error?: Error,
) => {
  const { clientID } = mutation;
  const { version: prevVersion } = await getServerVersion(t);
  const nextVersion = prevVersion + 1;
  const lastMutationID = await getLastMutationId(t, clientID);
  const nextMutationID = lastMutationID + 1;
  console.log("nextVersion", nextVersion, "nextMutationID", nextMutationID);
  if (mutation.id < nextMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`,
    );
    return;
  }
  if (mutation.id > nextMutationID) {
    throw new Error(
      `Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
    );
  }

  if (error === undefined) {
    console.log("Processing mutation:", JSON.stringify(mutation));
    await handleMutation(mutation, t, nextVersion);
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      "Handling error from mutation",
      JSON.stringify(mutation),
      error,
    );
  }

  console.log("setting", clientID, "last_mutation_id to", nextMutationID);

  await setLastMutationId(t, clientID, groupId, nextMutationID, nextVersion);
  await updateServerVersion(t, nextVersion);
};
