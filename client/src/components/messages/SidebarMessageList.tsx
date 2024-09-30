import { IconButton } from "@/components/ui/iconbutton";
import { Separator } from "@/components/ui/separator";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RealtimeClientContext } from "@/main";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Message } from "core/message";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Trash } from "lucide-react";
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

  const seenMessages = messages?.filter((m) => m.seen);
  const unseenMessages = messages?.filter((m) => !m.seen);

  return (
    <div className="flex flex-col">
      <div className="text-lg font-semibold pt-2">
        Messages
        {messages && messages.length > 0 && (
          <>
            <span className="pl-2 text-sm">({messages.length})</span>
            <span className="pl-2 text-sm">
              ({unseenMessages?.length || 0} unseen)
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col">
        {unseenMessages && unseenMessages.length > 0 && (
          <>
            <div className="text-sm font-medium pt-2">Unseen Messages</div>
            {unseenMessages.map((message) => (
              <MessageInSidebar key={message.messageId} message={message} />
            ))}
          </>
        )}
        {seenMessages && seenMessages.length > 0 && (
          <>
            <div className="text-sm font-medium pt-2">Seen Messages</div>
            {seenMessages.map((message) => (
              <MessageInSidebar key={message.messageId} message={message} />
            ))}
          </>
        )}
        {messages && messages.length === 0 && (
          <div className="text-sm text-center pt-2 text-neutral-500">
            No messages
          </div>
        )}
      </div>
    </div>
  );
};

const MessageInSidebar = (props: {
  message: Awaited<ReturnType<typeof Message.queries.getMessagesForNode>>[0];
}) => {
  const [open, setOpen] = useState(false);
  const r = useContext(RealtimeClientContext);
  return (
    <motion.div className="dark:bg-neutral-800 rounded-md p-2 border border-neutral-300 bg-neutral-100 dark:border-neutral-600 gap-2">
      <div
        onClick={() => {
          setOpen(!open);
          r.mutate.markMessageAsSeen(props.message.messageId);
        }}
        className="flex w-full items-center justify-between"
      >
        <div className="flex gap-2 items-center">
          {!props.message.seen && (
            <Tooltip>
              <TooltipTrigger>
                <div className="rounded-full w-2 h-2 bg-red-500"></div>
              </TooltipTrigger>
              <TooltipContent side="left">Unseen</TooltipContent>
            </Tooltip>
          )}

          <div className="text-sm grow line-clamp-2">
            {props.message.message}
          </div>
        </div>
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
            className="relative"
          >
            <Separator className="my-1" />
            <div className="text-sm">
              <div>From: {props.message.senderId}</div>
              <div>
                Sent At: {new Date(props.message.createdAt).toLocaleString()}
              </div>
              <div>Direction: {props.message.direction}</div>
              <div>ID: {props.message.messageId}</div>
            </div>
            <div className="flex absolute bottom-0 right-0">
              <IconButton
                className="w-6 h-6"
                label="Delete"
                onClick={() => {
                  // Unselect the node
                  // sel.clearSelectedNode();
                  r.mutate.deleteMessage(props.message.messageId);
                }}
              >
                <Trash size={14} />
              </IconButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
