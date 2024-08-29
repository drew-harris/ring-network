import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator")({
  component: () => (
    <div>
      <div>Layout</div>
      <Outlet />
    </div>
  ),
});

