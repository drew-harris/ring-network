import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad({ context }) {
    if (context.auth.user) {
      return redirect({
        to: "/simulator",
      });
    } else
      return redirect({
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
