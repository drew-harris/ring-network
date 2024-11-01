import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createRoot } from "react-dom/client";
import { Replicache } from "replicache";
import { Node } from "core/node";
import { Message } from "core/message";
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
    .build(),
  name: getOrCreateName(),
  pullURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/pull`,
  pushURL: `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/push`,
  pullInterval: 8000,
});

const createWebSocket = () => {
  const ws = new WebSocket(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/poke`);

  ws.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });

  ws.addEventListener("message", (event) => {
    console.log("WS MESSAGE", event.data);
    rep.pull({ now: true });
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket connection closed. Reconnecting...");
    setTimeout(createWebSocket, 2000);
  });

  return ws;
};

createWebSocket();

export type RealtimeClient = typeof rep;

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    replicache: rep,
  },
});

export const RealtimeClientContext = React.createContext<RealtimeClient>(rep);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RealtimeClientContext.Provider value={rep}>
        <RouterProvider context={{ replicache: rep }} router={router} />
      </RealtimeClientContext.Provider>
    </QueryClientProvider>
  </StrictMode>,
);
