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
import { Message } from "core/message";
import { Node } from "core/node";
import { nanoid } from "nanoid";
import { useContext, useState } from "react";
import { useSubscribe } from "replicache-react";

interface SidebarSendFormProps {
  nodeId: string;
}
export const SidebarSendForm = ({ nodeId }: SidebarSendFormProps) => {
  const [message, setMessage] = useState("");
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("left");

  const r = useContext(RealtimeClientContext);
  const nodes = useSubscribe(r, Node.queries.getAllNodes, {
    default: [],
  });

  const getNodeLabelById = (id: string) => {
    return nodes.find((node) => node.nodeId === id)?.label || id;
  };

  const otherNodes = useSubscribe(
    r,
    async (tx) => {
      return (await Node.queries.getAllNodes(tx)).filter(
        (node) => node.nodeId !== nodeId,
      );
    },
    {
      default: [],
      dependencies: [nodeId],
    },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("RUNNIGN FORM");
    if (message.length !== 0) {
      if (targetNodeId !== null) {
        console.log("SENDING MESSAGE");
        r.mutate.sendMessage({
          label: Message.generateMessageId(),
          createdAt: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          direction,
          message,
          messageId: nanoid(6),
          reciverId: targetNodeId,
          senderId: nodeId,
        });
      }
    }

    // Reset form
    setMessage("");
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
          {otherNodes.map((node) => (
            <SelectItem
              onMouseEnter={() => setHoverNode(node.nodeId)}
              onMouseDown={() => setHoverNode(null)}
              value={node.nodeId}
              key={node.nodeId}
            >
              {node.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => setDirection(value as "left" | "right")}
        value={direction}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Direction" />
        </SelectTrigger>
        <SelectContent onMouseLeave={() => setHoverNode(null)}>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="default"
        className="w-full"
        disabled={message.length === 0 || targetNodeId === null}
        type="submit"
      >
        Send
      </Button>
    </form>
  );
};
