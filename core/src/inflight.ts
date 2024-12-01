import { z } from "zod";
import { Mutations } from "./utils";
import { ReadTransaction, Replicache } from "replicache";

export module InFlight {
  export const Info = z.object({
    messageId: z.string(),
    position: z.string(),
    color: z.string().nullable(),
  });

  export type Info = z.infer<typeof Info>;

  export const getById = async (
    tx: Replicache,
    messageId: string,
  ): Promise<Info | undefined> => {
    const flight = await tx.query(async (tx) => {
      const flight = await tx.get<Info>(`in_flight/${messageId}`);
      return flight as Info | undefined;
    });
    return flight;
  };

  export const mutations = new Mutations()
    .register(
      "createInFlight",
      z.object({
        messageId: z.string(),
        position: z.string(),
        color: z.string().nullable(),
      }),
      async (tx, input) => {
        return await tx.set(`in_flight/${input.messageId}`, {
          ...input,
        });
      },
    )
    .register(
      "moveInFlight",
      z.object({ messageId: z.string(), position: z.string() }),
      async (tx, input) => {
        const previousPosition = await tx.get<Info>(
          `in_flight/${input.messageId}`,
        );
        if (!previousPosition) {
          throw new Error(`Flight with id ${input.messageId} does not exist`);
        }
        return await tx.set(`in_flight/${input.messageId}`, {
          ...previousPosition,
          position: input.position,
        });
      },
    )
    .register(
      "deleteInFlight",
      z.object({ messageId: z.string() }),
      async (tx, input) => {
        return await tx.del(`in_flight/${input.messageId}`);
      },
    );

  export const queries = {
    // Get messages for a node by reciverId
    getAll: async (tx: ReadTransaction) => {
      const messages = await tx
        .scan<Info>({
          prefix: "in_flight",
        })
        .values()
        .toArray();
      return messages;
    },

    getAllFlightIds: async (tx: ReadTransaction) => {
      const messages = await tx
        .scan<Info>({
          prefix: "in_flight",
        })
        .values()
        .toArray();
      return messages
        .map((m) => m.messageId)
        .sort((a, b) => a.localeCompare(b));
    },

    getFlightsForNode: async (tx: ReadTransaction, nodeId: string) => {
      const allFlights = await tx
        .scan<Info>({
          prefix: `in_flight`,
        })
        .values()
        .toArray();
      return allFlights.filter((f) => f.position === nodeId);
    },

    getFlightPosition: async (tx: ReadTransaction, messageId: string) => {
      const flight = await tx.get<Info>(`in_flight/${messageId}`);
      return flight?.position;
    },
  };
}
