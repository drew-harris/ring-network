import { Button } from "@/components/ui/button";
import { useContainerDimensions } from "@/lib/containerSize";
import { RealtimeClientContext } from "@/main";
import { Node } from "core/node";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useContext, useMemo, useRef, useState } from "react";

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

        return (
          <motion.line
            key={`${node.nodeId}-line`}
            x1={x}
            y1={y}
            x2={nextX}
            y2={nextY}
            stroke="#404040"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
          />
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
    [scale, height, width]
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
                <motion.div
                  key={node.nodeId}
                  className="absolute"
                  initial={{
                    x: Math.round(
                      width / 2 +
                        radius *
                          Math.cos((index * Math.PI * 2) / props.nodes.length)
                    ),
                    y: Math.round(
                      height / 2 +
                        radius *
                          Math.sin((index * Math.PI * 2) / props.nodes.length)
                    ),
                  }}
                  animate={{
                    x: Math.round(
                      width / 2 +
                        radius *
                          Math.cos((index * Math.PI * 2) / props.nodes.length)
                    ),
                    y: Math.round(
                      height / 2 +
                        radius *
                          Math.sin((index * Math.PI * 2) / props.nodes.length)
                    ),
                  }}
                >
                  <div
                    onClick={() => {
                      console.log("clicked", node.nodeId);
                      r.mutate.deleteNode(node.nodeId);
                    }}
                    className="p-2 bg-neutral-700 rounded-md border border-neutral-600 min-w-12 text-center"
                  >
                    <div>{node.nodeId}</div>
                  </div>
                </motion.div>
              )
          )}
        </>
      ) : null}
    </div>
  );
};
