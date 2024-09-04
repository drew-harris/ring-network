import { Sidebar } from "@/components/Sidebar";
import { useSelectedNode } from "@/stores/selectedNode";
import { AnimatePresence, motion } from "framer-motion";

export const SidebarShower = () => {
  const selectedNode = useSelectedNode((s) => s.selectedNode);
  const clearSelectedNode = useSelectedNode((s) => s.clearSelectedNode);
  return (
    <AnimatePresence initial={false}>
      {selectedNode && (
        <motion.div
          transition={{ duration: 0.1 }}
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="flex relative flex-col m-5 w-64 bg-neutral-800/50 p-4 rounded-md border border-neutral-600"
        >
          <Sidebar selectedNodeId={selectedNode} />
          <div
            onClick={clearSelectedNode}
            className="absolute top-0 right-0 p-2 rounded-md hover:bg-neutral-700/50 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
