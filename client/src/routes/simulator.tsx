import { Navbar } from "@/components/layout/navbar";
import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator")({
  component: SimulatorLayout,
});

function SimulatorLayout() {
  return (
    <div className="flex flex-col bg-green-600 h-screen">
      <Navbar />
      <div className="flex-1 bg-purple-800">
        <Outlet />
      </div>
    </div>
  );
}
