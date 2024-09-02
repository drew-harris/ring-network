import { Navbar } from "@/components/layout/navbar";
import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator")({
  component: SimulatorLayout,
});

function SimulatorLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
