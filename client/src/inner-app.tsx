import { useContext } from "react";
import { UserContext } from "./stores/userStore";
import { RouterProvider } from "@tanstack/react-router";

import { RealtimeClient, RouterType } from "./main";

export const InnerApp = ({
  rep,
  router,
}: {
  rep: RealtimeClient;
  router: RouterType;
}) => {
  const auth = useContext(UserContext);

  return <RouterProvider context={{ replicache: rep, auth }} router={router} />;
};
