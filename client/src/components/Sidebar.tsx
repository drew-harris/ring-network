import { RealtimeClientContext } from "@/main";
import { useSelectedNode } from "@/stores/selectedNode";
import { Node } from "core/node";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

interface SidebarProps {
  selectedNodeId: string;
}
export const Sidebar = (props: SidebarProps) => {
  const r = useContext(RealtimeClientContext);
  const clearSelectedNode = useSelectedNode((s) => s.clearSelectedNode);
  const data = useSubscribe(
    r,
    (tx) => Node.queries.singleNode(tx, props.selectedNodeId),
    {
      dependencies: [props.selectedNodeId],
    },
  );
  return (
    <div>
      <div>Sidebar</div>
      <div>{JSON.stringify(data, null, 2)}</div>
      <button
        onClick={() => {
          clearSelectedNode();
          r.mutate.deleteNode(props.selectedNodeId);
        }}
      >
        Delete
      </button>
    </div>
  );
};
