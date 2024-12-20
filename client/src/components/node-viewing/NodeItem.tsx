import { motion } from "framer-motion";
import { Node } from "core/node";
import { cn } from "@/lib/utils";
import { useSelectedNode } from "@/stores/selectedNode";
import { InFlight } from "core/inflight";
import { useContext, useEffect, useMemo, useRef } from "react";
import { RealtimeClientContext } from "@/main";
import { useSubscribe } from "replicache-react";

interface NodeItemProps {
  node: Node.Info;
  index: number;
  width: number;
  height: number;
  radius: number;
  totalNodes: number;
}

export const NodeItem = ({
  node,
  index,
  width,
  height,
  radius,
  totalNodes,
}: NodeItemProps) => {
  const angle = (index * Math.PI * 2) / totalNodes;
  const x = Math.round(width / 2 + radius * Math.cos(angle));
  const y = Math.round(height / 2 + radius * Math.sin(angle));

  const selectedNode = useSelectedNode((state) => state.selectedNode);
  const setSelectedNode = useSelectedNode((s) => s.setSelectedNode);
  const hoveredNode = useSelectedNode((state) => state.hoverNode);

  return (
    <motion.div
      transition={{ duration: 0.1 }}
      layoutId={node.nodeId}
      layout
      className={cn(
        "absolute cursor-pointer",
        node.status == "inactive" && "opacity-50",
      )}
      initial={{ x, y }}
      animate={{ x, y, scale: hoveredNode == node.nodeId ? 1.4 : 1 }}
    >
      <div
        onClick={() => {
          setSelectedNode(node.nodeId);
        }}
        className={cn(
          "p-3 text-black dark:text-white text-xl light:shadow bg-neutral-200 dark:bg-neutral-700 rounded-md border border-neutral-400 dark:border-neutral-600 min-w-12 text-center",
          selectedNode == node.nodeId &&
            "outline outline-2 outline-neutral-400 dark:outline-neutral-200",
          node.status == "inactive" && "opacity-50",
        )}
      >
        <div>{node.label}</div>
      </div>
    </motion.div>
  );
};

type FlightProps = {
  flight: InFlight.Info;
  nodes: Node.Info[];
  width: number;
  height: number;
  defaultPosition?: string;
  radius: number;
  totalNodes: number;
};

const nodeWidth = 54; // Assuming 48px width
const nodeHeight = 40; // Assuming 32px height

export const Flight = ({
  nodes,
  width,
  height,
  flight,
  defaultPosition,
  radius,
  totalNodes,
}: FlightProps) => {
  const r = useContext(RealtimeClientContext);
  const nodePosition = useSubscribe(
    r,
    (tx) => InFlight.queries.getFlightPosition(tx, flight.messageId),
    {
      default: defaultPosition,
    },
  );

  const position = useMemo(() => {
    const nodeIndex = nodes.findIndex((n) => n.nodeId === nodePosition);
    const angle = (nodeIndex * Math.PI * 2) / totalNodes;
    return {
      x: Math.round(width / 2 + radius * Math.cos(angle)) + nodeWidth / 2,
      y: Math.round(height / 2 + radius * Math.sin(angle)) + nodeHeight / 2,
    };
  }, [nodePosition, nodes, width, height, radius, totalNodes]);

  // Keep track of the previous position to animate from
  const prevPosition = useRef(position);

  useEffect(() => {
    prevPosition.current = position;
  }, [position]);

  return (
    <motion.div
      key={flight.messageId} // Only use messageId as key
      layoutId={flight.messageId}
      initial={position}
      animate={position}
      transition={{ duration: 0.9 }}
      className="w-4 h-4 rounded-full"
      style={{
        position: "absolute",
        backgroundColor: flight.color || "#00aaff",
      }}
    ></motion.div>
  );
};
