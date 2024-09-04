import { Button } from "@/components/ui/button";
import { useContainerDimensions } from "@/lib/containerSize";
import { RealtimeClientContext } from "@/main";
import { Node } from "core/node";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { RefObject, useContext, useMemo, useRef, useState } from "react";
import { NodeItem } from "./NodeItem";
import { useSelectedNode } from "@/stores/selectedNode";

const NodeLines = ({
  nodes,
  width,
  height,
  radius,
}: {
  nodes: Node.Info[];
  width: number;
  height: number;
  radius: number;
}) => {
  const nodeWidth = 48; // Assuming 48px width
  const nodeHeight = 32; // Assuming 32px height

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {nodes.map((node, index) => {
        if (!node.nodeId) return null;
        const angle = (index * Math.PI * 2) / nodes.length;
        const nextAngle =
          (((index + 1) % nodes.length) * Math.PI * 2) / nodes.length;

        const x = width / 2 + radius * Math.cos(angle) + nodeWidth / 2;
        const y = height / 2 + radius * Math.sin(angle) + nodeHeight / 2;
        const nextX = width / 2 + radius * Math.cos(nextAngle) + nodeWidth / 2;
        const nextY =
          height / 2 + radius * Math.sin(nextAngle) + nodeHeight / 2;

        // Calculate midpoint for the plus icon
        const midX = (x + nextX) / 2;
        const midY = (y + nextY) / 2;

        return (
          <g key={`${node.nodeId}-line-group`}>
            <motion.line
              key={`${node.nodeId}-line`}
              stroke="#404040"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{
                x1: x,
                pathLength: 1,
                y1: y,
                x2: nextX,
                y2: nextY,
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.g
              className="opacity-50 hover:opacity-100 pointer-events-auto"
              initial={{ scale: 0, opacity: 0, x: midX, y: midY }}
              animate={{ scale: 1, opacity: 0.5, x: midX, y: midY }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <motion.circle
                r="10"
                fill="#404040"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              />
              <motion.path
                d="M -6 0 H 6 M 0 -6 V 6"
                stroke="white"
                strokeWidth="2"
                transition={{ duration: 0.1 }}
              />
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
};

interface NodeViewProps {
  nodes: Node.Info[];
  containerRef: RefObject<HTMLDivElement>;
}

export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(props.containerRef);
  const [scale, _] = useState(0.74);
  const radius = useMemo(
    () => (Math.min(width, height) / 2) * scale,
    [scale, height, width],
  );

  const r = useContext(RealtimeClientContext);

  const createNode = () => {
    r.mutate.createNode({ nodeId: nanoid(4).toUpperCase() });
  };

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
          <div className="absolute p-2">
            <Button className="block" variant="outline" onClick={createNode}>
              Create Node
            </Button>
          </div>
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
