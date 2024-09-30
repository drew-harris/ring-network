import { z } from "zod";
import { Mutations } from "./utils";
import { ReadTransaction, WriteTransaction } from "replicache";
export module Node {
  export const Info = z.object({
    label: z.string(),
    nodeId: z.string(),
    leftNeighbor: z.string(),
    rightNeighbor: z.string(),
    status: z.enum(["active", "inactive"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `N-${Math.floor(Math.random() * 100000000)}`;

  const getNode = async (
    tx: WriteTransaction | ReadTransaction,
    nodeId: string,
  ) => {
    return tx.get<Info>(`nodes/${nodeId}`);
  };

  export const mutations = new Mutations()
    .register(
      "insertNode",
      z.object({
        nodeId: z.string(),
        label: z.string(),
        after: z.string(), // The node id it comes after
      }),
      async (tx, input) => {
        console.log("creating node", input);
        const nodeId = input.nodeId;
        const after = input.after;

        // Check if nodeId already exists
        const existingNode = await getNode(tx, nodeId);
        if (existingNode) {
          throw new Error(`Node with id ${nodeId} already exists`);
        }

        // Rewrite the node it comes after
        const right = await getNode(tx, after);
        if (!right) {
          throw new Error(`Node with id ${after} does not exist`);
        }

        const left = await getNode(tx, right?.leftNeighbor);
        if (!left) {
          throw new Error(`Node with id ${right.rightNeighbor} does not exist`);
        }

        // Create the node
        await tx.set(`nodes/${nodeId}`, {
          leftNeighbor: left.nodeId,
          nodeId,
          label: input.label,
          rightNeighbor: left.rightNeighbor,
          status: "active",
        } satisfies Info);

        // Rewrite the left node
        await tx.set(`nodes/${left.nodeId}`, {
          ...left,
          rightNeighbor: nodeId,
        });

        // Rewrite the right node
        await tx.set(`nodes/${right.nodeId}`, {
          ...right,
          leftNeighbor: nodeId,
        });
      },
    )

    .register("deleteNode", z.string(), async (tx, input) => {
      // Make sure the length of nodes > 3
      const nodes = await tx
        .scan<Node.Info>({
          prefix: "nodes",
        })
        .values()
        .toArray();

      if (nodes.length <= 3) {
        throw new Error("Cannot delete last node");
      }

      console.log("deleting node", input);
      const nodeToDelete = await getNode(tx, input);
      if (!nodeToDelete) {
        throw new Error(`Node with id ${input} does not exist`);
      }

      // Update left neighbor
      const leftNeighbor = await getNode(tx, nodeToDelete.leftNeighbor);
      if (leftNeighbor) {
        await tx.set(`nodes/${leftNeighbor.nodeId}`, {
          ...leftNeighbor,
          rightNeighbor: nodeToDelete.rightNeighbor,
        });
      }

      // Update right neighbor
      const rightNeighbor = await getNode(tx, nodeToDelete.rightNeighbor);
      if (rightNeighbor) {
        await tx.set(`nodes/${rightNeighbor.nodeId}`, {
          ...rightNeighbor,
          leftNeighbor: nodeToDelete.leftNeighbor,
        });
      }

      // Delete the node
      await tx.del(`nodes/${input}`);
    })
    .register("toggleStatus", z.string(), async (tx, input) => {
      console.log("toggling status", input);
      const node = await tx.get<Info>(`nodes/${input}`);
      if (!node) {
        return;
      }
      if (node.status === "active") {
        await tx.set(`nodes/${input}`, {
          ...node,
          status: "inactive",
        });
      } else {
        await tx.set(`nodes/${input}`, {
          ...node,
          status: "active",
        });
      }
    });
  export const getInitialState = () => {
    return [
      {
        leftNeighbor: "N-10",
        nodeId: "N-1",
        label: "N-1",
        rightNeighbor: "N-2",
        status: "active",
      },
      {
        leftNeighbor: "N-1",
        nodeId: "N-2",
        label: "N-2",
        rightNeighbor: "N-3",
        status: "active",
      },
      {
        leftNeighbor: "N-2",
        nodeId: "N-3",
        label: "N-3",
        rightNeighbor: "N-4",
        status: "active",
      },
      {
        leftNeighbor: "N-3",
        nodeId: "N-4",
        label: "N-4",
        rightNeighbor: "N-5",
        status: "active",
      },
      {
        leftNeighbor: "N-5",
        nodeId: "N-6",
        label: "N-6",
        rightNeighbor: "N-7",
        status: "active",
      },
      {
        leftNeighbor: "N-4",
        nodeId: "N-5",
        label: "N-5",
        rightNeighbor: "N-6",
        status: "active",
      },
      {
        leftNeighbor: "N-6",
        nodeId: "N-7",
        label: "N-7",
        rightNeighbor: "N-8",
        status: "active",
      },
      {
        leftNeighbor: "N-7",
        nodeId: "N-8",
        label: "N-8",
        rightNeighbor: "N-9",
        status: "active",
      },
      {
        leftNeighbor: "N-8",
        nodeId: "N-9",
        label: "N-9",
        rightNeighbor: "N-10",
        status: "active",
      },
      {
        leftNeighbor: "N-9",
        nodeId: "N-10",
        label: "N-10",
        rightNeighbor: "N-1",
        status: "active",
      },
    ] satisfies Info[];
  };

  export const transformNodeToOp = (node: Info) => {
    return {
      op: "put" as const,
      key: `nodes/${node.nodeId}`,
      value: node,
    };
  };

  export const queries = {
    getAllNodes: async (tx: ReadTransaction) => {
      const nodes = await tx
        .scan<Node.Info>({
          prefix: "nodes",
        })
        .values()
        .toArray();

      // Order nodes by leftNeighbor
      const first = nodes.find((node) => node.label === "N-1");

      if (!first) {
        return [];
      }

      let finalList: Info[] = [first];
      let nextOne: undefined | Info = await getNode(tx, first.leftNeighbor);
      if (!nextOne) {
        return [];
      }
      while (nextOne !== first) {
        if (!nextOne) {
          break;
        }
        finalList.push(nextOne);
        // @ts-ignore
        const possNext = await tx.get<Node.Info>(
          `nodes/${nextOne.leftNeighbor}`,
        );
        if (!possNext) {
          break;
        }
        nextOne = possNext;
      }

      return finalList;
    },

    singleNode: async (tx: ReadTransaction, nodeId: string) => {
      const node = await tx.get<Node.Info>(`nodes/${nodeId}`);
      return node;
    },

    totalNodeCount: async (tx: ReadTransaction) => {
      const nodes = await tx
        .scan<Node.Info>({
          prefix: "nodes",
        })
        .values()
        .toArray();

      return nodes.length;
    },

    getNewNodeName: async (tx: ReadTransaction) => {
      const nodes = await tx
        .scan<Node.Info>({
          prefix: "nodes",
        })
        .values()
        .toArray();

      let i = 1;
      while (true) {
        const name = `N-${i}`;
        if (!nodes.find((node) => node.label === name)) {
          return name;
        }
        i++;
      }
    },
  };
}
