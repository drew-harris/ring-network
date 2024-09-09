import { IconButton } from "@/components/ui/iconbutton";
import { RealtimeClientContext } from "@/main";
import { useSelectedMessages } from "@/stores/selectedMessages";
import { Trash } from "lucide-react";
import { useContext } from "react";

export const MessageTableActions = () => {
  const selected = useSelectedMessages((s) => s.selectedMessages);
  const clearSelected = useSelectedMessages((s) => s.clearAllSelectedMessages);
  const r = useContext(RealtimeClientContext);
  const deleteSelected = () => {
    r.mutate.bulkDeleteMessages(Object.keys(selected));
    clearSelected();
  };
  return (
    <div className="flex gap-2">
      <IconButton
        className="h-8 w-8"
        label="Delete"
        disabled={Object.keys(selected).length === 0}
        onClick={() => {
          deleteSelected();
        }}
      >
        <Trash size={14} />
      </IconButton>
    </div>
  );
};
