import { Checkbox } from "@/components/ui/checkbox";
import { Node } from "core/node";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RealtimeClientContext } from "@/main";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Message } from "core/message";
import { ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useContext } from "react";
import { useSubscribe } from "replicache-react";

export type MessageSubscribeData = Awaited<
  ReturnType<typeof Message.queries.getAllMessages>
>;

interface MessageTableProps {
  data: MessageSubscribeData;
  selected: Record<string, boolean>;
  setSelected: Dispatch<SetStateAction<Record<string, boolean>>>;
}

const columnHelper = createColumnHelper<MessageSubscribeData[0]>();

export type RowSelectionState = Record<string, boolean>;

export const MessageTable = ({
  data,
  selected,
  setSelected,
}: MessageTableProps) => {
  const r = useContext(RealtimeClientContext);
  const nodes = useSubscribe(r, Node.queries.getAllNodes, {
    default: [],
  });

  const getNodeLabelById = (id: string) => {
    return nodes.find((node) => node.nodeId === id)?.label || id;
  };

  const defaultColumns = [
    columnHelper.accessor("label", {
      header: "ID",
    }),
    columnHelper.accessor("message", {
      header: "Message",
      size: 400,
      minSize: 300,
      maxSize: 600,
    }),
    columnHelper.accessor("senderId", {
      cell(props) {
        return getNodeLabelById(props.getValue());
      },
      header: "From",
    }),
    columnHelper.accessor("reciverId", {
      cell(props) {
        return getNodeLabelById(props.getValue());
      },
      header: "To",
    }),
    columnHelper.accessor("direction", {
      header: "Direction",
    }),
    columnHelper.accessor("status", {
      header: "Status",
    }),
    columnHelper.accessor("path", {
      header: "Path",
      cell(props) {
        return props
          .getValue()
          .map((id) => getNodeLabelById(id))
          .join(" →");
      },
    }),
  ];
  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId(originalRow) {
      return originalRow.messageId;
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    state: {
      rowSelection: selected,
    },
    onRowSelectionChange: (s) => {
      setSelected(s);
    },
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            <TableHead>
              <Checkbox
                className=""
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(e) => {
                  table.toggleAllRowsSelected(e !== "indeterminate" && e);
                }}
              />
            </TableHead>

            {hg.headers.map((h) => (
              <TableHead
                onClick={h.column.getToggleSortingHandler()}
                key={h.id}
              >
                <div className="flex items-center justify-between">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() ? (
                    <span>
                      {h.column.getIsSorted() === "asc" ? (
                        <ChevronDown className="text-neutral-500 transition-transform duration-200 transform rotate-180" />
                      ) : (
                        <ChevronDown className="text-neutral-500" />
                      )}
                    </span>
                  ) : null}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            selected={row.getIsSelected()}
            aria-selected={row.getIsSelected()}
            key={row.id}
          >
            <TableCell>
              <Checkbox
                className=""
                checked={row.getIsSelected()}
                onCheckedChange={(e) => {
                  row.toggleSelected(e !== "indeterminate" && e);
                }}
              />
            </TableCell>
            {row.getVisibleCells().map((cell) => (
              <TableCell width={cell.column.columnDef.size} key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
