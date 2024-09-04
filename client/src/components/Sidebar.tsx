import { useSelectedNode } from "@/stores/selectedNode";
import { AnimatePresence, motion } from "framer-motion";

export const Sidebar = () => {
  const selectedNode = useSelectedNode((s) => s.selectedNode);
  return (
    <AnimatePresence initial={false}>
      {selectedNode && (
        <motion.div
          transition={{ duration: 0.1 }}
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="flex flex-col m-5 w-64 bg-neutral-800/50 p-4 rounded-md border border-neutral-600"
        >
          <div className="flex flex-col gap-2">SELECTION</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
