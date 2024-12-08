import { SidebarMessageList } from "@/components/messages/SidebarMessageList";
import { SidebarSendForm } from "@/components/messages/SidebarSendForm";
import { IconButton } from "@/components/ui/iconbutton";
import { Separator } from "@/components/ui/separator";
import { RealtimeClientContext } from "@/main";
import { useSelectedNode } from "@/stores/selectedNode";
import { UserContext } from "@/stores/userStore";
import { Node } from "core/node";
import { Minus, Plus, Power, Trash } from "lucide-react";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

interface SidebarProps {
  selectedNodeId: string;
}

export const Sidebar = (props: SidebarProps) => {
  const r = useContext(RealtimeClientContext);
  const data = useSubscribe(
    r,
    (tx) => Node.queries.singleNode(tx, props.selectedNodeId),
    {
      dependencies: [props.selectedNodeId],
    },
  );

  const sel = useSelectedNode();
  const userCtx = useContext(UserContext);

  const totalNodeCount = useSubscribe(r, Node.queries.totalNodeCount, {
    default: 0,
  });

  if (!data) {
    return null;
  }

  if (!userCtx.user) {
    return null;
  }

  return (
    <div>
      <div className="text-lg font-bold">
        {data.label} (Inbox Size: {data.inboxSize})
      </div>
      <div className="flex gap-2 w-full">
        {data.label !== "N1" && (
          <IconButton
            disabled={totalNodeCount <= 3}
            label="Delete"
            onClick={() => {
              sel.setSelectedNode(data.leftNeighbor);
              r.mutate.deleteNode(props.selectedNodeId);
            }}
          >
            <Trash size={14} />
          </IconButton>
        )}

        {userCtx.user.type === "admin" && (
          <>
            <IconButton
              label="Toggle Active"
              onClick={() => {
                r.mutate.toggleStatus(props.selectedNodeId);
              }}
            >
              <Power size={14} />
            </IconButton>
            <IconButton
              label="Decrease Size"
              disabled={data.inboxSize <= 1}
              onClick={() => {
                if (data.inboxSize > 0) {
                  r.mutate.setInboxSize({
                    nodeId: data.nodeId,
                    inboxSize: data.inboxSize - 1,
                  });
                }
              }}
            >
              <Minus size={14} />
            </IconButton>
            <IconButton
              label="Increase Size"
              onClick={() => {
                r.mutate.setInboxSize({
                  nodeId: data.nodeId,
                  inboxSize: data.inboxSize + 1,
                });
              }}
            >
              <Plus size={14} />
            </IconButton>
          </>
        )}
      </div>
      <Separator className="mt-4" />
      <SidebarSendForm nodeId={data.nodeId} />
      <Separator className="mt-4" />
      <SidebarMessageList nodeId={data.nodeId} />
    </div>
  );
};
