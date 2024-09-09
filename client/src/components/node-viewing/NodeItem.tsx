import { motion } from "framer-motion";
import { Node } from "core/node";
import { cn } from "@/lib/utils";
import { useContext, useState } from "react";
import { RealtimeClientContext } from "@/main";
import { createPortal } from "react-dom";
import { useSelectedNode } from "@/stores/selectedNode";

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
          "p-3 text-xl bg-neutral-700 rounded-md border border-neutral-600 min-w-12 text-center",
          selectedNode == node.nodeId &&
            "outline outline-2 outline-primary-500",
          node.status == "inactive" && "opacity-50",
        )}
      >
        <div>{node.nodeId}</div>
      </div>
    </motion.div>
  );
};
