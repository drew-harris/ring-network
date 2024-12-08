import { z } from "zod";
import { AuthRouterType } from "realtime/email";
import { hc } from "hono/client";

export module User {
  export const passwordSchema = z
    .string()
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%&])[A-Za-z\d@$%#&]{6,}$/);

  export const Info = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    type: z.enum(["admin", "operator"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `U-${Math.floor(Math.random() * 100000000)}`;

  // API Key
  // @ts-ignore
}
