import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RealtimeClientContext } from "@/main";
import { useSelectedNode } from "@/stores/selectedNode";
import { Node } from "core/node";
import { nanoid } from "nanoid";
import { useContext, useEffect, useState } from "react";
import { useSubscribe } from "replicache-react";

interface SidebarSendFormProps {
  nodeId: string;
}
export const SidebarSendForm = ({ nodeId }: SidebarSendFormProps) => {
  const [message, setMessage] = useState("");
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const r = useContext(RealtimeClientContext);
  const otherNodeIds = useSubscribe(
    r,
    async (tx) => {
      return (await Node.queries.getAllNodes(tx))
        .filter((node) => node.nodeId !== nodeId)
        .map((node) => node.nodeId);
    },
    {
      default: [],
      dependencies: [nodeId],
    },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("RUNNIGN FORM");
    if (message.length === 0) {
      setError("Message cannot be empty");
    } else {
      if (targetNodeId !== null) {
        r.mutate.sendMessage({
          message,
          messageId: nanoid(6),
          reciverId: targetNodeId,
          senderId: nodeId,
        });
      }
      setError("");
    }

    // Reset form
    setMessage("");
    setTargetNodeId(null);
  };

  const setHoverNode = useSelectedNode((state) => state.setHoverNode);

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
      <div className="font-medium pt-4">Send Message</div>
      <Textarea
        className="w-full"
        placeholder="Type a message..."
        onChange={(e) => setMessage(e.target.value)}
        value={message}
      ></Textarea>
      <Select
        defaultValue={targetNodeId || undefined}
        onValueChange={(value) => setTargetNodeId(value)}
        value={targetNodeId || undefined}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Target Node" />
        </SelectTrigger>
        <SelectContent onMouseLeave={() => setHoverNode(null)}>
          {otherNodeIds.map((nodeId) => (
            <SelectItem
              onMouseEnter={() => setHoverNode(nodeId)}
              onMouseDown={() => setHoverNode(null)}
              value={nodeId}
              key={nodeId}
            >
              {nodeId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        className="w-full"
        disabled={message.length === 0 || targetNodeId === null}
        type="submit"
      >
        Send
      </Button>
    </form>
  );
};
