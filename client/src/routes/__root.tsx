import { TooltipProvider } from "@/components/ui/tooltip";
import { RealtimeClient } from "@/main";
import { UserStoreContext } from "@/stores/userStore";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

type RouterContext = {
  replicache: RealtimeClient;
  auth: UserStoreContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <TooltipProvider>
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
      </TooltipProvider>
    </>
  ),
});
