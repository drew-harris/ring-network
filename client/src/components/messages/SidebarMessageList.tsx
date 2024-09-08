import { RealtimeClientContext } from "@/main";
import { Message } from "core/message";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

interface SidebarMessageListProps {
  nodeId: string;
}

export const SidebarMessageList = (props: SidebarMessageListProps) => {
  const r = useContext(RealtimeClientContext);
  const messages = useSubscribe(
    r,
    async (tx) => await Message.queries.getMessagesForNode(tx, props.nodeId),
    {
      dependencies: [props.nodeId],
    },
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">Messages</div>
        {messages?.map((message) => (
          <MessageInSidebar key={message.messageId} message={message} />
        ))}
      </div>
    </div>
  );
};

const MessageInSidebar = (props: {
  message: Awaited<ReturnType<typeof Message.queries.getMessagesForNode>>[0];
}) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-sm font-bold">{props.message.message}</div>
      <div className="text-sm">{props.message.direction}</div>
    </div>
  );
};
