import { TooltipProvider } from "@/components/ui/tooltip";
import { RealtimeClient } from "@/main";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

type RouterContext = {
  replicache: RealtimeClient;
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
