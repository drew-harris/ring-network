import { NodeView } from "@/components/node-viewing/NodeView";
import { SidebarShower } from "@/components/SidebarShower";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { InFlight } from "core/inflight";
import { Node } from "core/node";
import { useContext, useRef } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator/")({
  component: SimulatorIndexPage,
  async loader({ context }) {
    return {
      nodes: await context.replicache.query(Node.queries.getAllNodes),
      flights: await context.replicache.query(InFlight.queries.getAll),
    };
  },
});

function SimulatorIndexPage() {
  const r = useContext(RealtimeClientContext);
  const { nodes: initialNodes, flights: initialFlights } =
    Route.useLoaderData();
  const data = useSubscribe(r, Node.queries.getAllNodes, {
    default: initialNodes,
  });
  const componentRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex grow h-full">
      <div ref={componentRef} className="grow">
        <NodeView
          defaultFlights={initialFlights}
          containerRef={componentRef}
          nodes={data}
        />
      </div>
      <SidebarShower />
    </div>
  );
}
