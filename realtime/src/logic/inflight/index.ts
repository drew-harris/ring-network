import { InFlight } from "core/inflight";
import { ServerMutations } from "../../server-mutation";
import { InFlight_TB } from "../../schema";
import { eq } from "drizzle-orm";

export const inflightServerMutations: ServerMutations<
  (typeof InFlight)["mutations"]
> = {
  createInFlight: async (tx, input, nextVersion) => {
    await tx.insert(InFlight_TB).values([
      {
        ...input,
        version: nextVersion,
      },
    ]);
  },

  moveInFlight: async (tx, input, nextVersion) => {
    await tx
      .update(InFlight_TB)
      .set({
        position: input.position,
        version: nextVersion,
      })
      .where(eq(InFlight_TB.messageId, input.messageId));
  },

  deleteInFlight: async (tx, input, nextVersion) => {
    await tx
      .update(InFlight_TB)
      .set({
        deleted: true,
        version: nextVersion,
      })
      .where(eq(InFlight_TB.messageId, input.messageId));
  },
};
