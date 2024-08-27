import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Replicache } from "replicache";
import { nanoid } from "nanoid";
import { Node } from "core/node";
import { Mutations } from "core/utils";

const rep = new Replicache({
  licenseKey: import.meta.env.VITE_PUBLIC_REPLICACHE_LICENSE_KEY as string,
  mutators: new Mutations().extend(Node.mutations).build(),
  name: nanoid(5),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
