import { z } from "zod";
import { Mutations } from "./utils";
import { ReadTransaction, Replicache, WriteTransaction } from "replicache";

export module Node {
  export const Info = z.object({
    label: z.string(),
    nodeId: z.string(),
    leftNeighbor: z.string(),
    rightNeighbor: z.string(),
    inboxSize: z.number(),
    status: z.enum(["active", "inactive"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `N${Math.floor(Math.random() * 100000000)}`;

  const getNode = async (
    tx: WriteTransaction | ReadTransaction,
    nodeId: string,
  ) => {
    return tx.get<Info>(`nodes/${nodeId}`);
  };

  export const getById = async (
    tx: Replicache,
    nodeId: string,
  ): Promise<Info | undefined> => {
    const node = await tx.query(async (tx) => {
      const node = await tx.get<Info>(`nodes/${nodeId}`);
      return node as Info | undefined;
    });
    return node;
  };

  export const mutations = new Mutations()
    .register(
      "insertNode",
      z.object({
        nodeId: z.string(),
        label: z.string(),
        after: z.string(), // The node id it comes after
        inboxSize: z.number().optional(),
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
          inboxSize: input.inboxSize || 20,
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

    .register(
      "setInboxSize",
      z.object({
        nodeId: z.string(),
        inboxSize: z.number(),
      }),
      async (tx, input) => {
        const node = await tx.get<Info>(`nodes/${input.nodeId}`);
        if (!node) {
          return;
        }
        await tx.set(`nodes/${input}`, {
          ...node,
          inboxSize: input.inboxSize,
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
      const first = nodes.find((node) => node.label === "N1");

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

      // Order nodes by leftNeighbor
      const first = nodes.find((node) => node.label === "N1");

      if (!first) {
        return 0;
      }

      let finalList: Info[] = [first];
      let nextOne: undefined | Info = await getNode(tx, first.leftNeighbor);
      if (!nextOne) {
        return 0;
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

      return finalList.length;
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
        const name = `N${i}`;
        if (!nodes.find((node) => node.label === name)) {
          return name;
        }
        i++;
      }
    },
  };
}
