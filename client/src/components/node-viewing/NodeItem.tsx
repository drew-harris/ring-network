import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
} from "framer-motion";
import { Node } from "core/node";
import { cn } from "@/lib/utils";
import { useSelectedNode } from "@/stores/selectedNode";
import { InFlight } from "core/inflight";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
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
    <>
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
    </>
  );
};

type FlightProps = {
  messageId: string;
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
  messageId,
  defaultPosition,
  radius,
  totalNodes,
}: FlightProps) => {
  const r = useContext(RealtimeClientContext);
  const nodePosition = useSubscribe(
    r,
    (tx) => InFlight.queries.getFlightPosition(tx, messageId),
    {
      default: defaultPosition,
    },
  );
  const position = useMemo(() => {
    const nodeIndex = nodes.findIndex((n) => n.nodeId === nodePosition);
    const angle = (nodeIndex * Math.PI * 2) / totalNodes;
    return {
      x: Math.round(width / 2 + radius * Math.cos(angle)),
      y: Math.round(height / 2 + radius * Math.sin(angle)),
    };
  }, [nodePosition, nodes, width, height, radius, totalNodes]);

  // Keep track of the previous position to animate from
  const prevPosition = useRef(position);

  useEffect(() => {
    prevPosition.current = position;
  }, [position]);

  return (
    <motion.div
      key={messageId} // Only use messageId as key
      layoutId={messageId}
      initial={position}
      animate={position}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 120,
        mass: 1,
      }}
      className="w-24 z-50 h-24 rounded-full bg-blue-400"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {messageId}
    </motion.div>
  );
};
