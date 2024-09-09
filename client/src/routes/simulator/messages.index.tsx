import {
  MessageSubscribeData,
  MessageTable,
} from "@/components/messages/MessageTable";
import { MessageTableActions } from "@/components/messages/MessageTableActions";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Message } from "core/message";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator/messages/")({
  async loader({ context }) {
    return {
      regular: await context.replicache.query(
        async (tx) => await Message.queries.getAllMessages(tx, "node"),
      ),
      archive: await context.replicache.query(
        async (tx) => await Message.queries.getAllMessages(tx, "archive"),
      ),
      undelivered: await context.replicache.query(
        async (tx) => await Message.queries.getAllMessages(tx, "undelivered"),
      ),
    };
  },
  component: MessageTablePage,
});

function MessageTablePage() {
  const r = useContext(RealtimeClientContext);
  const loadedData = Route.useLoaderData();

  const regular = useSubscribe(
    r,
    (tx) => Message.queries.getAllMessages(tx, "node"),
    {
      default: loadedData.regular,
    },
  );

  const archive = useSubscribe(
    r,
    (tx) => Message.queries.getAllMessages(tx, "archive"),
    {
      default: loadedData.archive,
    },
  );

  const undelivered = useSubscribe(
    r,
    (tx) => Message.queries.getAllMessages(tx, "undelivered"),
    {
      default: loadedData.undelivered,
    },
  );

  const [regularSelected, setRegularSelected] = useState<
    Record<string, boolean>
  >({});

  const [archivedSelected, setArchivedSelected] = useState<
    Record<string, boolean>
  >({});

  const [undeliveredSelected, setUndeliveredSelected] = useState<
    Record<string, boolean>
  >({});

  const PageSection = ({
    title,
    data,
    selected,
    setSelected,
    allowArchive,
  }: {
    title: string;
    data: MessageSubscribeData;
    selected: Record<string, boolean>;
    setSelected: Dispatch<SetStateAction<Record<string, boolean>>>;
    allowArchive?: boolean;
  }) => {
    return (
      <div className="pt-4 max-w-7xl">
        <div className="flex w-full items-end justify-between pb-2">
          <h1 className="block text-xl">{title}</h1>
          {data.length > 0 && (
            <MessageTableActions
              allowArchive={allowArchive}
              selected={selected}
              clearSelected={() => {
                setSelected({});
              }}
            />
          )}
        </div>
        <div className="">
          {data.length > 0 ? (
            <MessageTable
              selected={selected}
              setSelected={setSelected}
              data={data}
            />
          ) : (
            <div className="text-center">
              <h1 className="opacity-40">No messages</h1>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <PageSection
        title="Delivered"
        data={regular}
        selected={regularSelected}
        setSelected={setRegularSelected}
        allowArchive
      />
      <PageSection
        title="Undelivered"
        data={undelivered}
        selected={undeliveredSelected}
        setSelected={setUndeliveredSelected}
        allowArchive
      />
      <PageSection
        title="Archived"
        data={archive}
        selected={archivedSelected}
        setSelected={setArchivedSelected}
      />
    </div>
  );
}
