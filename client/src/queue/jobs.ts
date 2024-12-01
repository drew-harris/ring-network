import { z, ZodSchema } from "core/zod";
import { Job, JobFn } from ".";
import { Message } from "core/message";
import { Node } from "core/node";
import { InFlight } from "core/inflight";

export const createJobFn = <
  Arg1 extends ZodSchema,
  Callback extends JobFn<z.output<Arg1>>,
>(
  arg1: Arg1,
  cb: Callback,
): ((data: z.output<Arg1>) => Job<z.output<Arg1>>) => {
  return (data: z.input<Arg1>) => {
    return {
      data,
      run: async (params) => {
        return await cb.apply(cb, [
          {
            params: data,
            queue: params.queue,
            replicache: params.replicache,
          },
        ]);
      },
    };
  };
};

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

    const result = await moveInFlight({
      messageId: params.messageId,
      newPosition: nextDestination,
    }).run({ replicache, queue });
  },
);

export const createMessageJob = createJobFn(
  Message.schemas.createMessage,
  async ({ params, replicache, queue }) => {
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
