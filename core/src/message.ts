import { Mutations } from "./utils";
import { z } from "./zod";

export module Message {
  export const Info = z.object({
    messageId: z.string(),
    senderId: z.string(),
    reciverId: z.string(),
    message: z.string(),
    createdAt: z.string(),
    receivedAt: z.string(),
    direction: z.enum(["left", "right"]),
    path: z.array(z.string()),
    // TODO: Add status
  });

  export type Info = z.infer<typeof Info>;

  export const mutations = new Mutations()
    .register(
      "sendMessage",
      z.object({
        messageId: z.string(),
        senderId: z.string(),
        reciverId: z.string(),
        message: z.string(),
      }),
      (tx, input) => {
        return tx.set(input.messageId, input);
      },
    )
    .register("blank", z.null(), () => {
      return "good work drew";
    });
}
