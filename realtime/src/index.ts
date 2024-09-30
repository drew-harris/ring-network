import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createTransaction } from "./db";
import {
  getLastMutationIdChanges,
  getServerVersion,
  processMutation,
  reset,
} from "./sync-utils";
import { PullRequestV1, PullResponseV1, PushRequestV1 } from "replicache";
import { getChangedNodes } from "./logic/node/getChanged";

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/pull", async (c) => {
  const pull: PullRequestV1 = await c.req.json();
  const { clientGroupID } = pull;
  const fromVersion = parseInt(pull.cookie?.toString() || "0") ?? 0;

  const res = await createTransaction(async (tx) => {
    const serverVersion = await getServerVersion(tx);
    if (fromVersion > serverVersion.version) {
      throw new Error(
        `fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
      );
    }

    const lastMutationIDChanges = await getLastMutationIdChanges(
      tx,
      clientGroupID,
      fromVersion,
    );

    const ops = await getChangedNodes(tx, fromVersion);

    return {
      cookie: serverVersion.version,
      patch: ops,
      lastMutationIDChanges: lastMutationIDChanges,
    } satisfies PullResponseV1;
  });

  return c.json(res);
});

app.post("/push", async (c) => {
  const push: PushRequestV1 = await c.req.json();
  const t0 = Date.now();
  try {
    for (const mutation of push.mutations) {
      const t1 = Date.now();
      try {
        await createTransaction(async (t) => {
          await processMutation(t, push.clientGroupID, mutation);
        });
      } catch (err: unknown) {
        if (!(err instanceof Error)) {
          throw err;
        }
        console.error(err);
        await createTransaction(async (t) => {
          await processMutation(t, push.clientGroupID, mutation, err);
        });
      }
    }
    return c.json({});
  } catch {
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

app.get("/reset", async (c) => {
  await createTransaction(async (tx) => {
    await reset(tx);
  });
  return c.json({ done: true });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

app.onError((err, c) => {
  console.error(err);
  c.status(500);
  return c.json({ error: "Internal server error" });
});

serve({
  fetch: app.fetch,
  port,
});
