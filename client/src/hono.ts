import { User } from "core/user";
import { hc } from "hono/client";
import { AuthRouterType } from "realtime/email";

const TS_PATH = import.meta.env.VITE_PUBLIC_BACKEND_URL!;

export const client = hc<AuthRouterType>(TS_PATH + "/auth/");

const API_PATH = import.meta.env.VITE_PUBLIC_JAVA_BACKEND_URL!;

export const Api = {
  getAllUsers: async () => {
    const response = await fetch(API_PATH + "/users", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get users");
    }

    return (await response.json()) as User.Info[];
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(API_PATH + `/users/${userId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },

  createUser: async (params: { user: User.Info; password: string }) => {
    const response = await fetch(API_PATH + "/users", {
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

    const _ = await client.email.$post({
      json: {
        email: params.user.email,
      },
    });

    const sendCodeResponse = await fetch(TS_PATH + "/auth/email", {
      body: JSON.stringify({
        email: params.user.email,
      }),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!sendCodeResponse.ok) {
      throw new Error("Failed to send code");
    }

    return (await response.json()) as User.Info;
  },

  updatePassword: async (params: { userId: string; password: string }) => {
    const response = await fetch(
      API_PATH + `/users/${params.userId}/password`,
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

  getFullCode: async (code: string) => {
    const response = await fetch(TS_PATH + `/users/code?code=${code}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get code");
    }

    return (await response.json()) as User.Info;
  },
};
