import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="p-8">
      <div>
        <Link to="/simulator">Go To Simulator</Link>
      </div>
    </div>
  ),
});
