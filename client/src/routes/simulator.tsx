import { Navbar } from "@/components/layout/navbar";
import { restrictPage } from "@/utils";
import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator")({
  beforeLoad: restrictPage,
  component: SimulatorLayout,
});

function SimulatorLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
