import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Replicache } from "replicache";
import { nanoid } from "nanoid";
import { Node } from "core/node";
import { Message } from "core/message";
import { Mutations } from "core/utils";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rep = new Replicache({
  licenseKey: import.meta.env.VITE_PUBLIC_REPLICACHE_LICENSE_KEY as string,
  mutators: new Mutations()
    .extend(Node.mutations)
    .extend(Message.mutations)
    .build(),
  name: nanoid(5),
  pullURL: "http://localhost:3000/pull",
});

export type RealtimeClient = typeof rep;

const router = createRouter({
  routeTree,
  context: {
    replicache: rep,
  },
});

export const RealtimeClientContext = React.createContext<RealtimeClient>(rep);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RealtimeClientContext.Provider value={rep}>
      <RouterProvider context={{ replicache: rep }} router={router} />
    </RealtimeClientContext.Provider>
  </StrictMode>,
);
