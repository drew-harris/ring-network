import { create } from "zustand";

interface SelectedNode {
  selectedNode: string | null;
  setSelectedNode: (node: string) => void;
  clearSelectedNode: () => void;
}

export const useSelectedNode = create<SelectedNode>((set) => ({
  selectedNode: null,
  setSelectedNode: (node: string) => set({ selectedNode: node }),
  clearSelectedNode: () => set({ selectedNode: null }),
}));
