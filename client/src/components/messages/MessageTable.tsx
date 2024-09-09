import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Message } from "core/message";

type MessageSubscribeData = Awaited<
  ReturnType<typeof Message.queries.getAllMessages>
>;

interface MessageTableProps {
  data: MessageSubscribeData;
}

export const MessageTable = ({ data }: MessageTableProps) => {
  return (
    <Table className="">
      <TableHeader>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Message</TableCell>
          <TableCell>Sender</TableCell>
          <TableCell>Reciever</TableCell>
          <TableCell>Direction</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((message) => (
          <TableRow key={message.messageId}>
            <TableCell>{message.messageId}</TableCell>
            <TableCell>{message.message}</TableCell>
            <TableCell>{message.senderId}</TableCell>
            <TableCell>{message.reciverId}</TableCell>
            <TableCell>{message.direction}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
