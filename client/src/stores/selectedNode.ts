import { create } from "zustand";

interface SelectedNode {
  selectedNode: string | null;
  setSelectedNode: (node: string) => void;
  clearSelectedNode: () => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

export const useSelectedNode = create<SelectedNode>((set) => ({
  selectedNode: null,
  showSidebar: false,
  setSelectedNode: (node: string) =>
    set({ selectedNode: node, showSidebar: true }),
  clearSelectedNode: () => set({ selectedNode: null }),
  setShowSidebar: (show: boolean) => set({ showSidebar: show }),
}));
