import { z, ZodSchema } from "core/zod";
import { Job, JobFn } from ".";
import { Message } from "core/message";

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
      runner: async (params) => {
        return await cb.apply(cb, [params.params]);
      },
    };
  };
};

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
    // await queue.add();
  },
);
