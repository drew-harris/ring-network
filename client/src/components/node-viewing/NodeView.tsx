import { useContainerDimensions } from "@/lib/containerSize";
import { Node } from "core/node";
import {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Flight, NodeItem } from "./NodeItem";
import { NodeLines } from "@/components/node-viewing/NodeLines";
import { RealtimeClientContext } from "@/main";
import { useSubscribe } from "replicache-react";
import { InFlight } from "core/inflight";

interface NodeViewProps {
  nodes: Node.Info[];
  defaultFlights: InFlight.Info[];
  containerRef: RefObject<HTMLDivElement>;
}

export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(props.containerRef);
  // const [scale, _] = useState(0.74);
  const scale = 0.75;
  const radius = useMemo(
    () => (Math.min(width, height) / 2) * scale,
    [scale, height, width],
  );

  // Only render content when width and height are non-zero
  const isInitialized = width > 0 && height > 0;

  const r = useContext(RealtimeClientContext);

  // const flightIds = useSubscribe(r, InFlight.queries.getAllFlightIds, {
  //   default: props.defaultFlights.map((f) => f.messageId),
  // });

  useEffect(() => {
    const cleanup = r.subscribe(
      InFlight.queries.getAllFlightIds,
      (flightIds) => {
        console.log("flightIds", flightIds);
        const oldFlightIds = flightIds;
        // Sort and compare to prevent rerenders
        for (let i = 0; i < oldFlightIds.length; i++) {
          if (oldFlightIds[i] !== flightIds[i]) {
            break;
          }
        }
        setFlightIds(oldFlightIds.sort());
      },
    );
    return cleanup;
  }, []);

  const [flightIds, setFlightIds] = useState(
    props.defaultFlights.map((f) => f.messageId),
  );

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
              key={fid}
              messageId={fid}
              defaultPosition={
                props.defaultFlights.find((f) => f.messageId === fid)?.position
              }
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
        </>
      ) : null}
    </div>
  );
};
