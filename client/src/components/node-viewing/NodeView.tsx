import { Button } from "@/components/ui/button";
import { useContainerDimensions } from "@/lib/containerSize";
import { RealtimeClientContext } from "@/main";
import { Node } from "core/node";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useContext, useMemo, useRef, useState } from "react";
import { NodeItem } from "./NodeItem";

// New component for drawing lines
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
  // Estimate node size (adjust these values based on your actual node size)
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
            <g className="transition-opacity duration-200 opacity-50 hover:opacity-100 pointer-events-auto">
              <circle cx={midX} cy={midY} r="10" fill="#404040" />
              <path
                d="M -6 0 H 6 M 0 -6 V 6"
                stroke="white"
                strokeWidth="2"
                transform={`translate(${midX}, ${midY})`}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

interface NodeViewProps {
  nodes: Node.Info[];
}

export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(componentRef);
  const [scale, setScale] = useState(0.84);
  const radius = useMemo(
    () => (Math.min(width, height) / 2) * scale,
    [scale, height, width],
  );

  const r = useContext(RealtimeClientContext);

  const deleteRandomNode = () => {
    const randomNodeId =
      props.nodes[Math.floor(Math.random() * props.nodes.length)].nodeId;

    console.log("deleting node", randomNodeId);
    r.mutate.deleteNode(randomNodeId);
  };

  const createNode = () => {
    r.mutate.createNode({ nodeId: nanoid(4) });
  };

  // Only render content when width and height are non-zero
  const isInitialized = width > 0 && height > 0;

  return (
    <div className="min-h-screen relative" ref={componentRef}>
      {isInitialized ? (
        <>
          <NodeLines
            nodes={props.nodes}
            width={width}
            height={height}
            radius={radius}
          />
          <div className="absolute">
            <div> Node Count: {props.nodes.length}</div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
            <Button
              className="block"
              variant="outline"
              onClick={deleteRandomNode}
            >
              Delete Random Node
            </Button>
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
                  onDelete={() => r.mutate.deleteNode(node.nodeId)}
                />
              ),
          )}
        </>
      ) : null}
    </div>
  );
};
