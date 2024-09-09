import { MessageTable } from "@/components/messages/MessageTable";
import { MessageTableActions } from "@/components/messages/MessageTableActions";
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
      <div className="flex w-full items-end justify-between pb-2">
        <h1 className="block text-xl">Messages</h1>
        <MessageTableActions />
      </div>
      <div className="max-w-7xl">
        <MessageTable data={data} />
      </div>
    </div>
  );
}
