import { Node } from "core/node";
import { ServerMutations } from "../../server-mutation";
import { Node_TB } from "../../schema";
import { eq } from "drizzle-orm";
import { Transaction } from "../../db";

export const getNodeById = async (tx: Transaction, nodeId: string) => {
  const node = await tx
    .select()
    .from(Node_TB)
    .where(eq(Node_TB.nodeId, nodeId))
    .then((a) => a.at(0));

  if (!node) {
    return null;
  }

  return node;
};

export const nodeServerMutations: ServerMutations<(typeof Node)["mutations"]> =
  {
    deleteNode: async (tx, input, nextVersion) => {
      const nodeCount = await tx.select().from(Node_TB);
      if (nodeCount.length <= 3) {
        throw new Error("Cannot delete last node");
      }

      const deletedNode = await tx
        .update(Node_TB)
        .set({
          deleted: true,
          version: nextVersion,
        })
        .where(eq(Node_TB.nodeId, input))
        .returning()
        .then((a) => a.at(0));

      if (!deletedNode) {
        throw new Error(`Node with id ${input} does not exist`);
      }

      await tx
        .update(Node_TB)
        .set({
          version: nextVersion,
          rightNeighbor: deletedNode.rightNeighbor,
        })
        .where(eq(Node_TB.nodeId, deletedNode.leftNeighbor));

      await tx
        .update(Node_TB)
        .set({
          version: nextVersion,
          leftNeighbor: deletedNode.leftNeighbor,
        })
        .where(eq(Node_TB.nodeId, deletedNode.rightNeighbor));

      return;
    },
    toggleStatus: async (tx, input, nextVersion) => {
      const node = await tx
        .select()
        .from(Node_TB)
        .where(eq(Node_TB.nodeId, input))
        .then((a) => a.at(0));

      if (!node) {
        return;
      }

      if (node.status === "active") {
        await tx
          .update(Node_TB)
          .set({
            status: "inactive",
            version: nextVersion,
          })
          .where(eq(Node_TB.nodeId, input));
      } else {
        await tx
          .update(Node_TB)
          .set({
            status: "active",
            version: nextVersion,
          })
          .where(eq(Node_TB.nodeId, input));
      }

      return;
    },

    insertNode: async (tx, input, nextVersion) => {
      const nodeId = input.nodeId;
      const after = input.after;

      // Check that you can't make more than 10
      const existingActiveNodes = await tx
        .select()
        .from(Node_TB)
        .where(eq(Node_TB.deleted, false));

      if (existingActiveNodes.length >= 10) {
        throw new Error("Cannot create more than 10 nodes");
      }

      // Check if nodeId already exists
      const existingNode = await tx
        .select()
        .from(Node_TB)
        .where(eq(Node_TB.nodeId, nodeId))
        .then((a) => a.at(0));

      if (existingNode) {
        throw new Error(`Node with id ${nodeId} already exists`);
      }

      const right = await getNodeById(tx, after);

      if (!right) {
        throw new Error(`Node with id ${after} does not exist`);
      }

      const left = await getNodeById(tx, right.leftNeighbor);

      if (!left) {
        throw new Error(`Node with id ${right.rightNeighbor} does not exist`);
      }

      await tx.insert(Node_TB).values([
        {
          nodeId: input.nodeId,
          label: input.label,
          leftNeighbor: left.nodeId,
          rightNeighbor: left.rightNeighbor,
          status: "active",
          deleted: false,
          version: nextVersion,
        },
      ]);

      // Rewrite the left node
      await tx
        .update(Node_TB)
        .set({
          version: nextVersion,
          rightNeighbor: nodeId,
        })
        .where(eq(Node_TB.nodeId, left.nodeId));

      // Rewrite the right node
      await tx
        .update(Node_TB)
        .set({
          version: nextVersion,
          leftNeighbor: nodeId,
        })
        .where(eq(Node_TB.nodeId, right.nodeId));
      return;
    },
  };
