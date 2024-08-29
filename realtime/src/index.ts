import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/pull", async (c) => {
  return c.json({
    lastMutationIDChanges: {},
    cookie: 42,
    patch: [
      { op: "clear" },
      {
        op: "put",
        key: "message/qpdgkvpb9ao",
        value: {
          from: "Jane",
          content: "Hey, what's for lunch?",
          order: 1,
        },
      },
      {
        op: "put",
        key: "message/5ahljadc408",
        value: {
          from: "Fred",
          content: "tacos?",
          order: 2,
        },
      },
    ],
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
