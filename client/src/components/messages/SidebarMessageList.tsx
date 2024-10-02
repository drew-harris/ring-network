import { IconButton } from "@/components/ui/iconbutton";
import autoAnimate from "@formkit/auto-animate";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Separator } from "@/components/ui/separator";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RealtimeClientContext } from "@/main";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Message } from "core/message";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, Trash } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
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

  const [parent, enableAnimations] = useAutoAnimate({
    duration: 200,
  });

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
      <div ref={parent} className="flex flex-col">
        {unseenMessages && unseenMessages.length > 0 && (
          <>
            <div className="text-sm font-medium pt-2">Inbox</div>
            {unseenMessages.map((message) => (
              <MessageInSidebar key={message.messageId} message={message} />
            ))}
          </>
        )}
        {seenMessages && seenMessages.length > 0 && (
          <>
            <div className="text-sm font-medium pt-2">Storage</div>
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
          // r.mutate.markMessageAsSeen(props.message.messageId);
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
              <div>ID: {props.message.label}</div>
            </div>
            <div className="absolute bottom-0 right-0">
              {!props.message.seen && (
                <IconButton
                  className="w-6 h-6"
                  label="Mark Seen"
                  onClick={() => {
                    // Unselect the node
                    // sel.clearSelectedNode();
                    r.mutate.markMessageAsSeen(props.message.messageId);
                  }}
                >
                  <Eye size={14} />
                </IconButton>
              )}
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
