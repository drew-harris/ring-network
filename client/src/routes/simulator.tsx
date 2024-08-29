import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Node } from "core/node";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
});

function SimulatorPage() {
  const r = useContext(RealtimeClientContext);
  const data = useSubscribe(r, async (tx) => {
    return await tx
      .scan<Node.Info>({
        prefix: "nodes",
      })
      .values()
      .toArray();
  });

  return (
    <div>
      <div>length: {data?.length}</div>
      <div>
        {data?.map((node) => <div key={node.nodeId}>{node.nodeId}</div>)}
      </div>
    </div>
  );
}
