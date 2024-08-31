import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator")({
  component: SimulatorLayout,
});

function SimulatorLayout() {
  return <Outlet />;
}
