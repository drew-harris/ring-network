import {
  MessageSubscribeData,
  MessageTable,
} from "@/components/messages/MessageTable";
import { MessageTableActions } from "@/components/messages/MessageTableActions";
import { RealtimeClientContext } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { Message } from "core/message";
import { Archive, Check } from "lucide-react";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useSubscribe } from "replicache-react";

export const Route = createFileRoute("/simulator/messages/")({
  async loader({ context }) {
    return {
      regular: await context.replicache.query(
        async (tx) => await Message.queries.getAllMessages(tx, "node"),
      ),
      systemBuffer: await context.replicache.query(
        async (tx) => await Message.queries.getAllMessages(tx, "system-buffer"),
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

  const systemBuffer = useSubscribe(
    r,
    (tx) => Message.queries.getAllMessages(tx, "system-buffer"),
    {
      default: loadedData.systemBuffer,
    },
  );

  const [regularSelected, setRegularSelected] = useState<
    Record<string, boolean>
  >({});

  const [systemBufferSelected, setSystemBufferSelected] = useState<
    Record<string, boolean>
  >({});

  const PageSection = ({
    title,
    data,
    selected,
    icon,
    setSelected,
    allowArchive,
  }: {
    title: string;
    icon?: React.ReactNode;
    data: MessageSubscribeData;
    selected: Record<string, boolean>;
    setSelected: Dispatch<SetStateAction<Record<string, boolean>>>;
    allowArchive?: boolean;
  }) => {
    return (
      <div className="pt-4 m-auto max-w-7xl">
        <div className="flex w-full items-end justify-between pb-2">
          <div className="flex gap-2 items-center">
            {icon}
            <h1 className="block text-xl">{title}</h1>
          </div>
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
        icon={
          <Check
            className="text-neutral-800 dark:text-neutral-300"
            size={20}
          ></Check>
        }
        data={regular}
        selected={regularSelected}
        setSelected={setRegularSelected}
        allowArchive
      />
      <PageSection
        title="System Buffer"
        icon={
          <Archive
            className="text-neutral-800 dark:text-neutral-300"
            size={20}
          ></Archive>
        }
        data={systemBuffer}
        selected={systemBufferSelected}
        setSelected={setSystemBufferSelected}
      />
    </div>
  );
}
