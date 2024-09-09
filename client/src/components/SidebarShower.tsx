import { Sidebar } from "@/components/Sidebar";
import { useSelectedNode } from "@/stores/selectedNode";
import { AnimatePresence, motion } from "framer-motion";

export const SidebarShower = () => {
  const selectedNode = useSelectedNode((s) => s.selectedNode);
  const clearSelectedNode = useSelectedNode((s) => s.clearSelectedNode);
  const showSidebar = useSelectedNode((s) => s.showSidebar);
  const setShowSidebar = useSelectedNode((s) => s.setShowSidebar);
  return (
    <AnimatePresence initial={false}>
      {(selectedNode || showSidebar) && (
        <motion.div
          transition={{ duration: 0.1 }}
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="flex relative light:shadow-md flex-col m-5 w-[300px] dark:bg-neutral-800/50 bg-white p-4 rounded-md border border-neutral-200 dark:border-neutral-600"
        >
          {selectedNode && <Sidebar selectedNodeId={selectedNode} />}
          {!selectedNode && (
            <div className="h-full grid place-items-center">
              <h2 className="opacity-40">Select a node to view</h2>
            </div>
          )}
          <div
            onClick={() => {
              clearSelectedNode();
              setShowSidebar(false);
            }}
            className="absolute top-0 right-0 p-2 rounded-md dark:hover:bg-neutral-700/50 hover:bg-neutral-200 cursor-pointer"
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
