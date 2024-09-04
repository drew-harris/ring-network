import { serve } from "@hono/node-server";
import { Node } from "core/node";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/pull", async (c) => {
  return c.json({
    lastMutationIDChanges: {},
    cookie: 42,
    patch: [
      { op: "clear" },
      ...Node.getInitialState().map((n) => Node.transformNodeToOp(n)),
    ],
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
