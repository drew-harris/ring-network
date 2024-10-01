import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Replicache } from "replicache";
import { Node } from "core/node";
import { Message } from "core/message";
import { User } from "core/user";
import { Mutations } from "core/utils";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import { nanoid } from "nanoid";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const getOrCreateName = () => {
  const name = localStorage.getItem("name");
  if (name) {
    return name;
  }
  const newName = nanoid(8);
  localStorage.setItem("name", newName);
  return newName;
};

const rep = new Replicache({
  licenseKey: import.meta.env.VITE_PUBLIC_REPLICACHE_LICENSE_KEY as string,
  logLevel: "debug",
  mutators: new Mutations()
    .extend(Node.mutations)
    .extend(Message.mutations)
    .extend(User.mutations)
    .build(),
  name: getOrCreateName(),
  pullURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/pull`,
  pushURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/push`,
  pullInterval: 8,
});

const websocket = new WebSocket(
  `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/poke`,
);

websocket.addEventListener("open", () => {
  console.log("connection established");
  websocket.addEventListener("message", (event) => {
    console.log("WS MESSAGE", event.data);
    rep.pull({ now: true });
  });
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
