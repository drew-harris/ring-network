import { NodeView } from "@/components/node-viewing/NodeView";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Node } from "core/node";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
  async loader({ context }) {
    return await context.replicache.query(Node.queries.getAllNodes);
  },
});

function SimulatorPage() {
  const r = useContext(RealtimeClientContext);
  const loadedData = Route.useLoaderData();
  const data = useSubscribe(r, Node.queries.getAllNodes, {
    default: loadedData,
  });
  return (
    <div>
      <NodeView nodes={data} />
    </div>
  );
}
