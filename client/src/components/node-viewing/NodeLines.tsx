import { RealtimeClientContext } from "@/main";
import { Node } from "core/node";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

export const NodeLines = ({
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
  const r = useContext(RealtimeClientContext);
  const nodeHeight = 32; // Assuming 32px height

  const totalNodeCount = useSubscribe(r, Node.queries.totalNodeCount, {
    default: 0,
  });

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

        const createNode = () => {
          r.mutate.insertNode({
            after: node.nodeId,
            nodeId: nanoid(4).toUpperCase(),
          });
        };

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
            {totalNodeCount < 10 && (
              <motion.g
                onClick={createNode}
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
            )}
          </g>
        );
      })}
    </svg>
  );
};
