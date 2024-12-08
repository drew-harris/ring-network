import { User } from "core/user";
import { hc } from "hono/client";
import { AuthRouterType } from "realtime/email";

const TS_PATH = import.meta.env.VITE_PUBLIC_BACKEND_URL!;

const client = hc<AuthRouterType>(TS_PATH + "/auth/");

const API_PATH = import.meta.env.VITE_PUBLIC_JAVA_BACKEND_URL!;

export const Api = {
  client: client,

  getAllUsers: async (): Promise<User.Info[]> => {
    const response = await client.users.$get();
    if (!response.ok) {
      throw new Error("Failed to get users");
    }

    return await response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await client.user.$delete({
      json: {
        username: userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },

  createUser: async (params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    type: "admin" | "operator";
  }) => {
    const response = await client.user.$put({
      json: {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        type: params.type,
      },
    });
    if (response.status !== 200) {
      throw new Error("Failed to create user");
    }
    const data = await response.json();
    return data.user;
  },

  updatePassword: async (params: { userId: string; password: string }) => {
    const response = await client.reset.$post({
      json: {
        password: params.password,
        username: params.userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update password");
    }
  },

  login: async (username: string, password: string) => {
    const response = await fetch(API_PATH + `/users/login`, {
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
