import { MessageTable } from "@/components/messages/MessageTable";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Message } from "core/message";
import { useContext } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator/messages/")({
  async loader({ context }) {
    return await context.replicache.query(Message.queries.getAllMessages);
  },
  component: MessageTablePage,
});

function MessageTablePage() {
  const r = useContext(RealtimeClientContext);
  const loadedData = Route.useLoaderData();

  const data = useSubscribe(r, Message.queries.getAllMessages, {
    default: loadedData,
  });

  return (
    <div className="p-4">
      <h1>Messages</h1>
      <div>
        <MessageTable data={data} />
      </div>
    </div>
  );
}

