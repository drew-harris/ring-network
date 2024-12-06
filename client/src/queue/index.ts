import { RealtimeClient } from "@/main";
import { z, ZodSchema } from "core/zod";

export const createJobFn = <
  Arg1 extends ZodSchema,
  Callback extends JobFn<z.output<Arg1>>,
>(
  _arg1: Arg1,
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

export type Job<P> = {
  data: P;
  run: (params: {
    replicache: RealtimeClient;
    queue: JobQueue;
  }) => PromiseLike<void>;
};

export type JobFn<P> = (params: {
  params: P;
  replicache: RealtimeClient;
  queue: JobQueue;
}) => PromiseLike<void>;

export class JobQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: Job<any>[] = [];
  private isProcessing: boolean = false;
  private readonly delay: number = 250;
  private replicache: RealtimeClient;

  constructor(replicache: RealtimeClient, delay: number = 250) {
    this.delay = delay;
    this.replicache = replicache;
  }

  public async add<P>(job: Job<P>): Promise<void> {
    this.queue.push(job);

    if (!this.isProcessing) {
      await this.process();
    }
  }

  private async process(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();

      if (job) {
        try {
          await job.run({
            replicache: this.replicache,
            queue: this,
          });
        } catch (error) {
          console.error("Job failed:", error);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, this.delay / this.queue.length),
        );
      }
    }

    this.isProcessing = false;
  }

  public clear(): void {
    this.queue = [];
  }

  public get pending(): number {
    return this.queue.length;
  }
}

export const createJobQueue = (
  replicache: RealtimeClient,
  delay: number = 1000,
) => {
  return new JobQueue(replicache, delay);
};
