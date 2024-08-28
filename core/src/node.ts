import { z } from "zod";
import { InferCallback, Mutations } from "./utils";
export module Node {
  export const Info = z.object({
    nodeId: z.string(),
    leftNeighbor: z.string(),
    rightNeighbor: z.string(),
    status: z.enum(["active", "inactive"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `N-${Math.floor(Math.random() * 100000000)}`;

  export const mutations = new Mutations()
    .register(
      "createNode",
      z.object({
        nodeId: z.string(),
      }),
      (tx, input) => {
        tx.set(input.nodeId, {
          leftNeighbor: "liw",
          nodeId: createId(),
          rightNeighbor: "8023",
          status: "inactive",
        } satisfies Info);
      },
    )
    .register("deleteNode", z.string(), async (tx, input) => {
      tx.del(input);
    });
}
