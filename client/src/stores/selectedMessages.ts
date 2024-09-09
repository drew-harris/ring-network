import { Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface SelectedMessages {
  selectedMessages: Record<string, boolean>;
  setSelectedMessages: (messages: Updater<Record<string, boolean>>) => void;
}

export const useSelectedMessages = create<SelectedMessages>((set, get) => ({
  selectedMessages: {},
  setSelectedMessages: (messages: Updater<Record<string, boolean>>) => {
    if (typeof messages !== "function") {
      set({ selectedMessages: messages });
      return;
    }
    const curMessages = get().selectedMessages;
    set({ selectedMessages: messages(curMessages) });
  },
}));
