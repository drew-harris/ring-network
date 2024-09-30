import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PullerResult, Replicache } from "replicache";
import { Node } from "core/node";
import { Message } from "core/message";
import { User } from "core/user";
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
    .extend(User.mutations)
    .build(),
  name: "simulator",
  pullURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/pull`,
  pushURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/push`,
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
