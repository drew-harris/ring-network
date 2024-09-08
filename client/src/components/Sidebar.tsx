import { SidebarMessageList } from "@/components/messages/SidebarMessageList";
import { SidebarSendForm } from "@/components/messages/SidebarSendForm";
import { IconButton } from "@/components/ui/iconbutton";
import { Separator } from "@/components/ui/separator";
import { RealtimeClientContext } from "@/main";
import { useSelectedNode } from "@/stores/selectedNode";
import { Node } from "core/node";
import { Power, RefreshCw, Trash } from "lucide-react";
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

  const totalNodeCount = useSubscribe(r, Node.queries.totalNodeCount, {
    default: 0,
  });

  const nodeAfter = useSubscribe(
    r,
    async (tx) => {
      const allNodes = await Node.queries.getAllNodes(tx);
      return allNodes.find(
        (node) => node.leftNeighbor === props.selectedNodeId,
      );
    },
    {
      dependencies: [props.selectedNodeId],
    },
  );

  if (!data) {
    return null;
  }
  return (
    <div>
      <div className="text-lg font-bold">{data.nodeId}</div>
      <div className="flex gap-2 w-full">
        <IconButton
          disabled={totalNodeCount <= 3}
          label="Delete"
          onClick={() => {
            // Unselect the node
            // sel.clearSelectedNode();
            sel.setSelectedNode(data.leftNeighbor);
            r.mutate.deleteNode(props.selectedNodeId);
          }}
        >
          <Trash size={14} />
        </IconButton>
        <IconButton
          label="Toggle Active"
          onClick={() => {
            r.mutate.toggleStatus(props.selectedNodeId);
          }}
        >
          <Power size={14} />
        </IconButton>
        <IconButton
          label="Rotate"
          onClick={() => {
            if (nodeAfter) {
              // r.mutate.swapWithPrevNode({
              //   nodeId: props.selectedNodeId,
              // });
            }
          }}
        >
          <RefreshCw size={14} />
        </IconButton>
      </div>
      <Separator className="mt-4" />
      <SidebarSendForm nodeId={data.nodeId} />
      <Separator className="mt-4" />
      <SidebarMessageList nodeId={data.nodeId} />
    </div>
  );
};
