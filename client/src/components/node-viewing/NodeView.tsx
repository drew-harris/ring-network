import { useContainerDimensions } from "@/lib/containerSize";
import { Node } from "core/node";
import { RefObject, useMemo, useRef } from "react";
import { NodeItem } from "./NodeItem";
import { NodeLines } from "@/components/node-viewing/NodeLines";

interface NodeViewProps {
  nodes: Node.Info[];
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
