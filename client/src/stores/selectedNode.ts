import { create } from "zustand";

interface SelectedNode {
  selectedNode: string | null;
  setSelectedNode: (node: string) => void;
  clearSelectedNode: () => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  hoverNode: string | null;
  setHoverNode: (node: string | null) => void;
  defaultInboxSize: number;
  setDefaultInboxSize: (size: number) => void;
}

export const useSelectedNode = create<SelectedNode>((set) => ({
  hoverNode: null,
  setHoverNode: (node: string | null) => set({ hoverNode: node }),
  selectedNode: null,
  showSidebar: false,
  setSelectedNode: (node: string) => {
    console.log(node);
    set({ selectedNode: node, showSidebar: true });
  },
  clearSelectedNode: () => set({ selectedNode: null }),
  setShowSidebar: (show: boolean) => set({ showSidebar: show }),
  defaultInboxSize: 5,
  setDefaultInboxSize: (size: number) => set({ defaultInboxSize: size }),
}));
