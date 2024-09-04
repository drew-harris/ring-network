import { NodeView } from "@/components/node-viewing/NodeView";
import { SidebarShower } from "@/components/SidebarShower";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Node } from "core/node";
import { useContext, useRef } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator/")({
  component: SimulatorIndexPage,
  async loader({ context }) {
    return await context.replicache.query(Node.queries.getAllNodes);
  },
});

function SimulatorIndexPage() {
  const r = useContext(RealtimeClientContext);
  const loadedData = Route.useLoaderData();
  const data = useSubscribe(r, Node.queries.getAllNodes, {
    default: loadedData,
  });
  const componentRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex grow h-full">
      <div ref={componentRef} className="grow">
        <NodeView containerRef={componentRef} nodes={data} />
      </div>
      <SidebarShower />
    </div>
  );
}
