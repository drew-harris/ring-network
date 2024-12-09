import { useContainerDimensions } from "@/lib/containerSize";
import { Node } from "core/node";
import { RefObject, useContext, useMemo, useRef } from "react";
import { Flight, NodeItem } from "./NodeItem";
import { NodeLines } from "@/components/node-viewing/NodeLines";
import { RealtimeClientContext } from "@/main";
import { useSubscribe } from "replicache-react";
import { InFlight } from "core/inflight";
import { UserContext } from "@/stores/userStore";
import { Input } from "../ui/input";
import { useSelectedNode } from "@/stores/selectedNode";

interface NodeViewProps {
  nodes: Node.Info[];
  defaultFlights: InFlight.Info[];
  containerRef: RefObject<HTMLDivElement>;
}

export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(props.containerRef);
  const scale = 0.75;

  const radius = useMemo(
    () => (Math.min(width, height) / 2) * scale,
    [scale, height, width],
  );

  // Only render content when width and height are non-zero
  const isInitialized = width > 0 && height > 0;

  const r = useContext(RealtimeClientContext);

  const flightIds = useSubscribe(r, InFlight.queries.getAllFlights, {
    default: props.defaultFlights.map((f) => f),
  });

  return (
    <div className="min-h-full relative h-full" ref={componentRef}>
      {isInitialized ? (
        <>
          <NodeLines
            nodes={props.nodes}
            width={width}
            height={height}
            radius={radius}
          />
          {flightIds.map((fid) => (
            <Flight
              flight={fid}
              key={fid.messageId}
              defaultPosition={fid.position}
              nodes={props.nodes}
              width={width}
              height={height}
              radius={radius}
              totalNodes={props.nodes.length}
            />
          ))}
          {props.nodes.map(
            (node, index) =>
              node.nodeId && (
                <NodeItem
                  key={node.nodeId}
                  node={node}
                  index={index}
                  width={width}
                  height={height}
                  radius={radius}
                  totalNodes={props.nodes.length}
                />
              ),
          )}

          <InboxSizeManager />
        </>
      ) : null}
    </div>
  );
};

const InboxSizeManager = () => {
  const [inboxSize, setInboxSize] = useSelectedNode((s) => [
    s.defaultInboxSize,
    s.setDefaultInboxSize,
  ]);

  const userCtx = useContext(UserContext);
  if (userCtx.user?.type !== "admin") {
    return null;
  }

  return (
    <div className="flex gap-2 absolute flex-col bottom-2 left-2">
      <div className="text-sm">Default Inbox Size</div>
      <Input
        type="number"
        value={inboxSize}
        onChange={(e) => setInboxSize(parseInt(e.target.value))}
        className="w-16 text-sm"
      />
    </div>
  );
};
