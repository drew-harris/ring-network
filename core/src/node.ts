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

  export const getInitialState = () => {
    return [
      {
        leftNeighbor: "N-10",
        nodeId: "N-1",
        rightNeighbor: "N-2",
        status: "active",
      },
      {
        leftNeighbor: "N-1",
        nodeId: "N-2",
        rightNeighbor: "N-3",
        status: "active",
      },
      {
        leftNeighbor: "N-2",
        nodeId: "N-3",
        rightNeighbor: "N-4",
        status: "active",
      },
      {
        leftNeighbor: "N-3",
        nodeId: "N-4",
        rightNeighbor: "N-5",
        status: "active",
      },
      {
        leftNeighbor: "N-4",
        nodeId: "N-5",
        rightNeighbor: "N-6",
        status: "active",
      },
      {
        leftNeighbor: "N-5",
        nodeId: "N-6",
        rightNeighbor: "N-7",
        status: "active",
      },
      {
        leftNeighbor: "N-6",
        nodeId: "N-7",
        rightNeighbor: "N-8",
        status: "active",
      },
      {
        leftNeighbor: "N-7",
        nodeId: "N-8",
        rightNeighbor: "N-9",
        status: "active",
      },
      {
        leftNeighbor: "N-8",
        nodeId: "N-9",
        rightNeighbor: "N-10",
        status: "active",
      },
      {
        leftNeighbor: "N-9",
        nodeId: "N-10",
        rightNeighbor: "N-1",
        status: "active",
      },
    ] satisfies Info[];
  };

  export const transformNodeToOpt = (node: Info) => {
    return {
      op: "put",
      key: `nodes/${node.nodeId}`,
      value: node,
    };
  };
}
