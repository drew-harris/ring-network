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

const successfulDelivery = createJobFn(
  z.object({
    messageId: z.string(),
  }),
  async ({ params, replicache, queue }) => {
    const message = await Message.getById(replicache, params.messageId);
    if (!message) {
      return;
    }

    // Add the process job to the queue
    await queue.add(
      handleMessagePosUpdate({
        messageId: params.messageId,
      }),
    );
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

    if (!sittingOnNode) {
      return;
    }

    let nextDestination: string | null = null;

    if (message.direction === "left") {
      nextDestination = sittingOnNode.rightNeighbor;
    } else {
      nextDestination = sittingOnNode.leftNeighbor;
    }

    let nextNode = await Node.getById(replicache, nextDestination);

    // Success
    // if (nextDestination === message.reciverId) {
    // }

    // Already looped around once
    if (nextDestination === message.senderId) {
      replicache.mutate.failSend({
        messageId: params.messageId,
        reason: "NodeNotFound",
      });
    }

    const result = await moveInFlight({
      messageId: params.messageId,
      newPosition: nextDestination,
    }).run({ replicache, queue });
  },
);

export const createMessageJob = createJobFn(
  Message.schemas.createMessage,
  async ({ params, replicache, queue }) => {
    // Adds the sender to the path anyways
    await replicache.mutate.sendMessage(params);
    await replicache.mutate.createInFlight({
      position: params.senderId,
      color: "#ff00ff",
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
