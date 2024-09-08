import { RealtimeClientContext } from "@/main";
import { Message } from "core/message";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronsDown } from "lucide-react";
import { useContext, useState } from "react";
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
    <div className="flex flex-col">
      <div className="text-lg font-semibold pt-2">
        Messages
        {messages && messages.length > 0 && (
          <span className="pl-2 text-sm">({messages.length})</span>
        )}
      </div>
      <div className="flex flex-col">
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
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="bg-neutral-800 rounded-md p-2 border border-neutral-600 gap-2 line-clamp-2">
      <div
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-sm grow">{props.message.message}</div>
        <div>
          <ChevronDown
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            size={14}
          />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.1 }}
            className=""
          >
            <div className="text-sm ">More info about the node</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
