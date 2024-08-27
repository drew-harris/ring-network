import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Replicache } from "replicache";
import { nanoid } from "nanoid";
import { Node } from "core/node";

const rep = new Replicache({
  licenseKey: import.meta.env.VITE_PUBLIC_REPLICACHE_LICENSE_KEY as string,
  mutators: {
    createNode: Node.createNode,
  },
  name: nanoid(5),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
