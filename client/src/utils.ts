import { redirect } from "@tanstack/react-router";
import { UserStoreContext } from "./stores/userStore";

export const restrictPage = (p: { context: { auth: UserStoreContext } }) => {
  if (!p.context.auth.user) {
    return redirect({
      to: "/login",
    });
  }
};
