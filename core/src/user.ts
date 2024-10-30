import { z } from "zod";

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
  const API_KEY = import.meta.env.VITE_PUBLIC_JAVA_BACKEND_URL!;

  export const Api = {
    getAllUsers: async () => {
      const response = await fetch(API_KEY + "/users", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get users");
      }

      return (await response.json()) as Info[];
    },

    deleteUser: async (userId: string) => {
      const response = await fetch(API_KEY + `/users/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
    },

    createUser: async (params: { user: Info; password: string }) => {
      const response = await fetch(API_KEY + "/users", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: params.user,
          password: params.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      return (await response.json()) as Info;
    },

    updatePassword: async (params: { userId: string; password: string }) => {
      const response = await fetch(
        API_KEY + `/users/${params.userId}/password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: params.password,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update password");
      }
    },

    login: async (username: string, password: string) => {
      const response = await fetch(API_KEY + `/users/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      return (await response.json()) as boolean;
    },
  };
}
