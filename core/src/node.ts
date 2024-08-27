import { z } from "zod";
export module Node {
  export const Info = z.object({
    nodeId: z.string(),
    leftNeighbor: z.string(),
    rightNeighbor: z.string(),
    status: z.enum(["active", "inactive"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `N-${Math.floor(Math.random() * 100000000)}`;
}
