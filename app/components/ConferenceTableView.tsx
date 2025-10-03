"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { StarIcon } from "lucide-react";
import moment from "moment-timezone";
import { useMemo } from "react";
import { getIANATimezone } from "../lib/date";
import { ConfEdition, Conference } from "../types/api";

interface ConferenceTableViewProps {
  conferences: Conference[];
  loading: boolean;
  pinnedIds: string[];
  onTogglePin: (title: string) => void;
}

type ConferenceRow = Conference & {
  firstEdition: Conference["confs"][0];
};

const columnHelper = createColumnHelper<ConferenceRow>();

function isDeadlinePassed(conf: ConfEdition) {
  const ianaTimezone = getIANATimezone(conf.timezone);
  const deadlineDate = moment
    .tz(
      conf.timeline[0].deadline || conf.timeline[0].abstract_deadline || "",
      ianaTimezone
    )
    .toDate();
  return deadlineDate.getTime() < Date.now();
}

export default function ConferenceTableView({
  conferences,
  loading,
  pinnedIds,
  onTogglePin,
}: ConferenceTableViewProps) {
  const data: ConferenceRow[] = useMemo(
    () =>
      conferences.map((conference) => ({
        ...conference,
        firstEdition: conference.confs[0],
      })),
    [conferences]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        id: "pin",
        header: "Pin",
        cell: ({ row }) => (
          <button
            onClick={() => onTogglePin(row.original.title)}
            className={`p-1 rounded-full transition-colors ${
              pinnedIds.includes(row.original.title)
                ? "text-blue-500 hover:text-blue-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={pinnedIds.includes(row.original.title) ? "Unpin" : "Pin"}
          >
            <StarIcon
              className={`w-4 h-4 ${
                pinnedIds.includes(row.original.title) ? "fill-current" : ""
              }`}
            />
          </button>
        ),
        size: 20,
      }),
      columnHelper.accessor("title", {
        id: "conference",
        header: "Conference",
        cell: ({ row }) => {
          const conference = row.original;
          const passed = isDeadlinePassed(conference.firstEdition);
          return (
            <div className="flex items-center justify-end truncate">
              <a
                href={conference.firstEdition.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium text-sm truncate block ${
                  passed
                    ? "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                    : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                }`}
                title={conference.firstEdition.link}
              >
                {conference.title} {conference.firstEdition.year}
              </a>
            </div>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("description", {
        id: "full_description",
        header: "Full Name",
        cell: ({ getValue, row }) => {
          const passed = isDeadlinePassed(row.original.firstEdition);
          return (
            <div
              className={`min-w-[300px] text-xs whitespace-normal line-clamp-2 ${
                passed
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-muted-foreground"
              }`}
            >
              {getValue() || "-"}
            </div>
          );
        },
        size: 300,
      }),
      columnHelper.accessor("firstEdition.timeline.abstract_deadline", {
        id: "abstract_deadline",
        header: "Abstract Deadline",
        cell: ({ row }) => {
          const timeline = row.original.firstEdition.timeline;
          const passed = isDeadlinePassed(row.original.firstEdition);
          if (!timeline || timeline.length === 0) {
            return (
              <span
                className={
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }
              >
                -
              </span>
            );
          }
          return (
            <div className="space-y-1">
              {timeline.map((timelineItem, index) => (
                <div key={index} className="text-xs">
                  {
                    <div
                      className={`font-medium ${
                        passed ? "text-gray-400 dark:text-gray-500" : ""
                      }`}
                    >
                      {timelineItem.abstract_deadline || "-"}
                    </div>
                  }
                  {timelineItem.comment && (
                    <div
                      className={`max-w-[200px] whitespace-normal italic ${
                        passed
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {timelineItem.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("firstEdition.timeline", {
        id: "paper_deadline",
        header: "Paper Deadline",
        cell: ({ getValue, row }) => {
          const timeline = getValue();
          const passed = isDeadlinePassed(row.original.firstEdition);
          if (!timeline || timeline.length === 0) {
            return (
              <span
                className={
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }
              >
                -
              </span>
            );
          }
          return (
            <div className="space-y-1">
              {timeline.map((timelineItem, index) => (
                <div key={index} className="text-xs">
                  {
                    <div
                      className={`font-medium ${
                        passed ? "text-gray-400 dark:text-gray-500" : ""
                      }`}
                    >
                      {timelineItem.deadline || "-"}
                    </div>
                  }
                  {timelineItem.comment && (
                    <div
                      className={`max-w-[200px] whitespace-normal italic ${
                        passed
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {timelineItem.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("firstEdition.timeline", {
        id: "notification",
        header: "Notification",
        cell: ({ getValue, row }) => {
          // TODO: implement notification deadline
          const timeline = getValue();
          const passed = isDeadlinePassed(row.original.firstEdition);
          if (!timeline || timeline.length === 0) {
            return (
              <span
                className={
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }
              >
                -
              </span>
            );
          }
          return (
            <div className="space-y-1">
              {timeline.map((timelineItem, index) => (
                <div key={index} className="text-xs">
                  {
                    <div
                      className={`font-medium ${
                        passed ? "text-gray-400 dark:text-gray-500" : ""
                      }`}
                    >
                      {timelineItem.notification || "-"}
                    </div>
                  }
                  {timelineItem.comment && (
                    <div
                      className={`max-w-[200px] whitespace-normal italic ${
                        passed
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {timelineItem.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("firstEdition.date", {
        id: "date",
        header: "Date",
        cell: ({ getValue, row }) => {
          const passed = isDeadlinePassed(row.original.firstEdition);
          return (
            <div
              className={`min-w-[80px] whitespace-normal text-sm ${
                passed ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {getValue()}
            </div>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("firstEdition.place", {
        id: "place",
        header: "Place",
        cell: ({ getValue, row }) => {
          const passed = isDeadlinePassed(row.original.firstEdition);
          return (
            <div
              className={`min-w-[140px] whitespace-normal text-sm ${
                passed ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {getValue()}
            </div>
          );
        },
        size: 140,
      }),
      columnHelper.accessor("sub", {
        id: "type",
        header: "Type",
        cell: ({ getValue, row }) => {
          const passed = isDeadlinePassed(row.original.firstEdition);
          return (
            <Badge
              variant="outline"
              className={`text-xs ${passed ? "opacity-50" : ""}`}
            >
              {getValue()}
            </Badge>
          );
        },
        size: 40,
      }),
      columnHelper.accessor("rank", {
        id: "ccf",
        header: "CCF",
        cell: ({ getValue, row }) => {
          const rank = getValue();
          const passed = isDeadlinePassed(row.original.firstEdition);
          return (
            <div className="flex flex-wrap gap-1">
              {rank.ccf && (
                <Badge
                  variant="outline"
                  className={`text-xs ${passed ? "opacity-50" : ""}`}
                >
                  {rank.ccf}
                </Badge>
              )}
            </div>
          );
        },
        size: 40,
      }),
    ],
    [pinnedIds, onTogglePin]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-w-[1400px] rounded-md border relative">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const passed = isDeadlinePassed(row.original.firstEdition);
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`relative ${passed ? "opacity-70" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        passed ? "text-gray-500 dark:text-gray-400" : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No conferences found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Render passed overlays outside the table structure */}
      {table.getRowModel().rows?.map((row) => {
        const passed = isDeadlinePassed(row.original.firstEdition);
        if (!passed) return null;

        // Calculate row position for overlay
        const rowIndex = table.getRowModel().rows.indexOf(row);
        const headerHeight = 40; // Approximate header height
        const rowHeight = 60; // Approximate row height
        const top = headerHeight + rowIndex * rowHeight;

        return (
          <div
            key={`overlay-${row.id}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{ top: `${top}px`, height: `${rowHeight}px` }}
          >
            <div className="transform rotate-340">
              <span className="text-2xl font-bold text-red-500 opacity-50">
                PASSED
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
