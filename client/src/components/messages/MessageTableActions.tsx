import { IconButton } from "@/components/ui/iconbutton";
import { RealtimeClientContext } from "@/main";
import { Archive, Trash } from "lucide-react";
import { useContext } from "react";

interface MessageTableActionsProps {
  selected: Record<string, boolean>;
  clearSelected: () => void;
  allowArchive?: boolean;
}

export const MessageTableActions = (props: MessageTableActionsProps) => {
  const r = useContext(RealtimeClientContext);
  const deleteSelected = () => {
    r.mutate.bulkDeleteMessages(Object.keys(props.selected));
    props.clearSelected();
  };
  return (
    <div className="flex gap-2">
      {props.allowArchive && (
        <IconButton
          className="h-8 w-8"
          label="Archive"
          disabled={Object.keys(props.selected).length === 0}
          onClick={async () => {
            await r.mutate.archiveMessages(Object.keys(props.selected));
            props.clearSelected();
          }}
        >
          <Archive size={14} />
        </IconButton>
      )}
      <IconButton
        className="h-8 w-8"
        label="Delete"
        disabled={Object.keys(props.selected).length === 0}
        onClick={() => {
          deleteSelected();
        }}
      >
        <Trash size={14} />
      </IconButton>
    </div>
  );
};
