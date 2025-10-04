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
import { useMemo } from "react";
import {
  isDatePassed,
  isFixedFutureDate,
  isSubmissionPassed,
  isTimelinePassed,
  parseMoment,
} from "../lib/date";
import { Conference, Timeline } from "../types/api";
import Countdown from "./Countdown";

interface ConferenceTableViewProps {
  conferences: Conference[];
  loading: boolean;
  pinnedIds: string[];
  onTogglePin: (title: string) => void;
}

type ConferenceRow = Conference & {
  currentEdition: Conference["confs"][0];
};

const columnHelper = createColumnHelper<ConferenceRow>();

function renderTimelineColumn(
  timeline: Timeline[],
  isEditionPassed: boolean,
  column: keyof Timeline,
  timezone: string
) {
  if (!timeline || timeline.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  let isPreviousTimelineActive = false;
  return (
    <div className="space-y-1">
      {timeline.map((timelineItem, index) => {
        const comment = column === "comment" ? timelineItem.comment : null;
        const deadline = column === "comment" ? null : timelineItem[column];
        const isDeadlinePassed = deadline && isDatePassed(deadline, timezone);
        const [date, time] = deadline
          ? deadline.replace("T", " ").split(" ")
          : ["-", "-"];

        const timelinePassed = isTimelinePassed(timelineItem, timezone);
        const timelineActive = !isPreviousTimelineActive && !timelinePassed;
        isPreviousTimelineActive = timelineActive;

        return (
          <div
            key={index}
            className={`h-8 text-xs 
              ${timelineActive ? "" : "text-gray-400 dark:text-gray-500"} 
              ${timelinePassed ? "line-through" : ""} 
              ${isEditionPassed ? "" : ""}`}
          >
            {/* show border between timeline items */}
            {index > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mb-1"></div>
            )}

            {column === "comment" ? (
              <div
                className={`min-w-[120px] whitespace-normal italic line-clamp-2`}
              >
                {comment ||
                  (timeline.length === 1 ? "Main stage" : `Stage ${index + 1}`)}
              </div>
            ) : deadline ? (
              <div
                className={`flex items-center gap-1 ${
                  isDeadlinePassed
                    ? "line-through text-gray-400 dark:text-gray-500"
                    : ""
                }`}
              >
                <div className={"font-mono font-medium"}>{date}</div>
                <div className="font-mono opacity-50">{time}</div>
              </div>
            ) : (
              <div className="opacity-50">-</div>
            )}
          </div>
        );
      })}
    </div>
  );
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
        currentEdition: conference.confs[0],
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
          const passed = isSubmissionPassed(conference.currentEdition);
          return (
            <div className="flex flex-col items-start justify-end truncate">
              <a
                href={conference.currentEdition.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium text-sm truncate block ${
                  passed
                    ? "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                    : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                }`}
                title={conference.currentEdition.link}
              >
                {conference.title} {conference.currentEdition.year}
              </a>
              <div
                className={`max-w-[400px] text-xs truncate ${
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }`}
              >
                {conference.description}
              </div>
            </div>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("currentEdition.timeline", {
        id: "abstract_deadline",
        header: "Abstract Deadline",
        cell: ({ getValue, row }) => {
          const timeline = getValue();
          const passed = isSubmissionPassed(row.original.currentEdition);

          return renderTimelineColumn(
            timeline,
            passed,
            "abstract_deadline",
            row.original.currentEdition.timezone
          );
        },
        size: 150,
      }),
      columnHelper.accessor("currentEdition.timeline", {
        id: "paper_deadline",
        header: "Paper Deadline",
        cell: ({ getValue, row }) => {
          const timeline = getValue();
          const passed = isSubmissionPassed(row.original.currentEdition);

          return renderTimelineColumn(
            timeline,
            passed,
            "deadline",
            row.original.currentEdition.timezone
          );
        },
        size: 150,
      }),
      columnHelper.accessor("currentEdition.timeline", {
        id: "notification",
        header: "Notification",
        cell: ({ getValue, row }) => {
          const timeline = getValue();
          const passed = isSubmissionPassed(row.original.currentEdition);

          return renderTimelineColumn(
            timeline,
            passed,
            "notification",
            row.original.currentEdition.timezone
          );
        },
        size: 150,
      }),
      columnHelper.accessor("currentEdition.timeline", {
        id: "comment",
        header: "Stage",
        cell: ({ getValue, row }) => {
          const timeline = getValue();
          const passed = isSubmissionPassed(row.original.currentEdition);

          return renderTimelineColumn(
            timeline,
            passed,
            "comment",
            row.original.currentEdition.timezone
          );
        },
      }),
      columnHelper.accessor("currentEdition.date", {
        id: "countdown",
        header: "Paper DDL Countdown",
        cell: ({ row }) => {
          const timeline = row.original.currentEdition.timeline;

          for (const t of timeline) {
            if (
              isFixedFutureDate(
                t.deadline,
                row.original.currentEdition.timezone
              )
            ) {
              const nextDeadline = parseMoment(
                t.deadline as string,
                row.original.currentEdition.timezone
              );
              return (
                <Countdown
                  deadline={nextDeadline.toDate()}
                  className="min-w-[150px] text-xs"
                  variant="compact"
                />
              );
            }
          }
          return (
            <span className="text-gray-400 dark:text-gray-500 text-right">
              -
            </span>
          );
        },
      }),
      columnHelper.accessor("currentEdition.date", {
        id: "date",
        header: "Date",
        cell: ({ getValue, row }) => {
          const passed = isSubmissionPassed(row.original.currentEdition);
          return (
            <div
              className={`text-xs text-right ${
                passed ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {getValue()}
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor("currentEdition.place", {
        id: "place",
        header: "Place",
        cell: ({ getValue, row }) => {
          const passed = isSubmissionPassed(row.original.currentEdition);
          return (
            <div
              className={`min-w-[120px] text-xs whitespace-normal ${
                passed ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {getValue()}
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor("sub", {
        id: "type",
        header: "Type",
        cell: ({ getValue, row }) => {
          const passed = isSubmissionPassed(row.original.currentEdition);
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
          const passed = isSubmissionPassed(row.original.currentEdition);
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
              {headerGroup.headers.map((header) => {
                // Define background colors for timeline column headers
                const getHeaderBackground = (columnId: string) => {
                  switch (columnId) {
                    case "abstract_deadline":
                    case "paper_deadline":
                    case "notification":
                    case "comment":
                      return "bg-muted/50";
                    default:
                      return "";
                  }
                };

                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    colSpan={header.colSpan}
                    className={getHeaderBackground(header.column.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const passed = isSubmissionPassed(row.original.currentEdition);
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`relative ${passed ? "opacity-70" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Define background colors for timeline columns
                    const getColumnBackground = (columnId: string) => {
                      switch (columnId) {
                        case "abstract_deadline":
                        case "paper_deadline":
                        case "notification":
                        case "comment":
                          return "bg-muted/25";
                        default:
                          return "";
                      }
                    };

                    return (
                      <TableCell
                        key={cell.id}
                        className={`${
                          passed ? "text-gray-500 dark:text-gray-400" : ""
                        } ${getColumnBackground(cell.column.id)}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
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
        const passed = isSubmissionPassed(row.original.currentEdition);
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
