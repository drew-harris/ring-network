import { RealtimeClient } from "@/main";

export type Job<P> = {
  data: P;
  runner: (params: {
    params: P;
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
          await job.runner({
            params: job.data,
            replicache: this.replicache,
            queue: this,
          });
        } catch (error) {
          console.error("Job failed:", error);
        }

        // Wait for the specified delay before processing the next job
        await new Promise((resolve) => setTimeout(resolve, this.delay));
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
  delay: number = 250,
) => {
  return new JobQueue(replicache, delay);
};
