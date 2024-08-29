import { useContainerDimensions } from "@/lib/containerSize";
import { Node } from "core/node";
import { useRef } from "react";

interface NodeViewProps {
  nodes: Node.Info[];
}
export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(componentRef);
  // Render nodes in a circular pattern like a clock
  const radius = (Math.min(width, height) / 2) * 0.7;
  return (
    <div className="min-h-screen" ref={componentRef}>
      {props.nodes.map(
        (node, index) =>
          node.nodeId && (
            <div
              key={node.nodeId}
              className="absolute"
              style={{
                left: Math.round(
                  width / 2 +
                    radius *
                      Math.cos((index * Math.PI * 2) / props.nodes.length),
                ),
                top: Math.round(
                  height / 2 +
                    radius *
                      Math.sin((index * Math.PI * 2) / props.nodes.length),
                ),
              }}
            >
              <div>Node lol</div>
            </div>
          ),
      )}
    </div>
  );
};
