import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader() {
    throw redirect({
      to: "/login",
    });
  },
  component: () => (
    <div className="p-8">
      <div>
        <Link to="/simulator">Go To Simulator</Link>
      </div>
    </div>
  ),
});
