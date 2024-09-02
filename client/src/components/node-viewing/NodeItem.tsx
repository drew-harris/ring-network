import { motion } from "framer-motion";
import { Node } from "core/node";

interface NodeItemProps {
  node: Node.Info;
  index: number;
  width: number;
  height: number;
  radius: number;
  totalNodes: number;
  onDelete: () => void;
}

export const NodeItem = ({
  node,
  index,
  width,
  height,
  radius,
  totalNodes,
  onDelete,
}: NodeItemProps) => {
  const angle = (index * Math.PI * 2) / totalNodes;
  const x = Math.round(width / 2 + radius * Math.cos(angle));
  const y = Math.round(height / 2 + radius * Math.sin(angle));

  return (
    <motion.div
      transition={{ duration: 0.1 }}
      className="absolute"
      initial={{ x, y }}
      animate={{ x, y }}
    >
      <div
        onClick={() => {
          console.log("clicked", node.nodeId);
          onDelete();
        }}
        className="p-2 bg-neutral-700 rounded-md border border-neutral-600 min-w-12 text-center"
      >
        <div>{node.nodeId}</div>
      </div>
    </motion.div>
  );
};
