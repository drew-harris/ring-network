import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createTransaction } from "./db";
import {
  getLastMutationIdChanges,
  getServerVersion,
  processMutation,
} from "./sync-utils";
import { PullRequestV1, PullResponseV1, PushRequestV1 } from "replicache";
import { getChangedNodes } from "./logic/node/getChanged";
import { createNodeWebSocket } from "@hono/node-ws";
import { WSContext } from "hono/ws";
import { getChangedMessages } from "./logic/message/getChanged";
import { forceResync } from "./force-resync";
import { getChangedInflight } from "./logic/inflight/getChanged";
import { authRouter } from "./email";
import { reset } from "./reset";

const app = new Hono();

let listeners: WSContext[] = [];

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get(
  "/poke",
  upgradeWebSocket((c) => {
    return {
      onOpen(evt, ws) {
        console.log("open");
        listeners.push(ws);
        ws.send("hello");
      },
      onClose(evt, ws) {
        console.log("close");
        listeners = listeners.filter((l) => l !== ws);
      },
    };
  }),
);

const doPoke = async () => {
  listeners.forEach((l) => {
    l.send("poke");
  });
};

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

    const nodeOps = await getChangedNodes(tx, fromVersion);
    const messageOps = await getChangedMessages(tx, fromVersion);
    const flightOps = await getChangedInflight(tx, fromVersion);

    return {
      cookie: serverVersion.version,
      patch: [...nodeOps, ...messageOps, ...flightOps],
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
    doPoke();
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

app.get("/resync", async (c) => {
  await forceResync();
  return c.json({ done: true });
});

app.route("/auth", authRouter);

const port = 3000;
console.log(`Server is running on port ${port}`);

app.onError((err, c) => {
  console.error(err);
  c.status(500);
  return c.json({ error: "Internal server error", message: err.message });
});

const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
