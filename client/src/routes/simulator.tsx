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
      <div>length: {data?.length}</div>
      <div>
        {data?.map((node) => (
          <div className="flex gap-2" key={node.nodeId}>
            <div>{node.leftNeighbor}</div>
            <div>{node.nodeId}</div>
            <div>{node.rightNeighbor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
