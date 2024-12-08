import { createJobFn } from "@/queue";
import { InFlight } from "core/inflight";
import { Message } from "core/message";
import { Node } from "core/node";
import { z } from "core/zod";

export const moveInFlight = createJobFn(
  z.object({
    messageId: z.string(),
    newPosition: z.string(),
  }),
  async ({ params, replicache, queue }) => {
    const flight = await InFlight.getById(replicache, params.messageId);
    if (!flight) {
      return;
    }
    await replicache.mutate.moveInFlight({
      messageId: params.messageId,
      position: params.newPosition,
    });

    await replicache.mutate.pushPath({
      messageId: params.messageId,
      newPosition: params.newPosition,
    });

    // Add the process job to the queue
    await queue.add(
      handleMessagePosUpdate({
        messageId: params.messageId,
      }),
    );
  },
);

const cleanupFlight = createJobFn(
  z.object({
    messageId: z.string(),
  }),
  async ({ params, replicache, queue }) => {
    const flight = await InFlight.getById(replicache, params.messageId);
    if (!flight) {
      return;
    }

    await replicache.mutate.deleteInFlight({
      messageId: params.messageId,
    });
  },
);

const successfulDelivery = createJobFn(
  z.object({
    messageId: z.string(),
  }),
  async ({ params, replicache, queue }) => {
    const message = await Message.getById(replicache, params.messageId);
    if (!message) {
      return;
    }

    replicache.mutate.successSend({
      messageId: params.messageId,
    });
  },
);

export const handleMessagePosUpdate = createJobFn(
  z.object({
    messageId: z.string(),
  }),
  async ({ params, replicache, queue }) => {
    const message = await Message.getById(replicache, params.messageId);
    if (!message) {
      return;
    }

    const currentPosition = await InFlight.getById(
      replicache,
      params.messageId,
    );
    if (!currentPosition) {
      return;
    }

    const sittingOnNode = await Node.getById(
      replicache,
      currentPosition.position,
    );

    if (sittingOnNode?.status === "inactive") {
      return replicache.mutate.failSend({
        messageId: params.messageId,
        reason: "NodeInactive",
      });
    }

    // Check if im there
    if (sittingOnNode?.nodeId === message.reciverId) {
      return await successfulDelivery({
        messageId: params.messageId,
      }).run({ replicache, queue });
    }

    if (!sittingOnNode) {
      return;
    }

    let nextDestination: string | null = null;

    if (message.direction === "left") {
      nextDestination = sittingOnNode.leftNeighbor;
    } else {
      nextDestination = sittingOnNode.rightNeighbor;
    }

    // Already looped around once
    if (nextDestination === message.senderId) {
      return replicache.mutate.failSend({
        messageId: params.messageId,
        reason: "NodeNotFound",
      });
    }

    await moveInFlight({
      messageId: params.messageId,
      newPosition: nextDestination,
    }).run({ replicache, queue });
  },
);

const brightColors = [
  "#FF1493", // bright pink
  "#00FF00", // lime green
  "#FF4500", // orange red
  "#00FFFF", // cyan
  "#FFD700", // gold
  "#FF00FF", // magenta
  "#32CD32", // lime
  "#FF69B4", // hot pink
  "#00FF7F", // spring green
  "#FFA500", // orange
];

function getRandomBrightColor() {
  return brightColors[Math.floor(Math.random() * brightColors.length)];
}

export const createMessageJob = createJobFn(
  Message.schemas.createMessage,
  async ({ params, replicache, queue }) => {
    // Adds the sender to the path anyways
    await replicache.mutate.sendMessage(params);
    await replicache.mutate.createInFlight({
      position: params.senderId,
      color: getRandomBrightColor(),
      messageId: params.messageId,
    });

    // Add the process job to the queue
    await queue.add(
      handleMessagePosUpdate({
        messageId: params.messageId,
      }),
    );
  },
);
