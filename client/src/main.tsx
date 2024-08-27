import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Replicache } from "replicache";
import { nanoid } from "nanoid";
import { Node } from "core/node";
import { Message } from "core/message";
import { Mutations } from "core/utils";

const rep = new Replicache({
  licenseKey: import.meta.env.VITE_PUBLIC_REPLICACHE_LICENSE_KEY as string,
  mutators: new Mutations()
    .extend(Node.mutations)
    .extend(Message.mutations)
    .build(),
  name: nanoid(5),
});

const result = await rep.mutate.blank(null);
console.log(result);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
