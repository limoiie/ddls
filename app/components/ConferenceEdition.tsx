import { isPast, isValid } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import moment from "moment-timezone";
import { Conference, ConferenceEvent, Timeline } from "../types/api";
import Countdown from "./Countdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getIANATimezone } from "../lib/date";
import { JSX } from "react";

interface ConferenceEditionProps {
  conf: ConferenceEvent;
  confSeries: Conference;
}

function isDeadlinePassed(conf: ConferenceEvent) {
  const ianaTimezone = getIANATimezone(conf.timezone);
  const deadlineDate = moment
    .tz(
      conf.timeline[0].deadline || conf.timeline[0].abstract_deadline || "",
      ianaTimezone
    )
    .toDate();
  return deadlineDate.getTime() < Date.now();
}

export default function ConferenceEdition({
  conf,
  confSeries,
}: ConferenceEditionProps) {
  const ianaTimezone = getIANATimezone(conf.timezone);

  const toDate = (
    deadline: Date | string | number | undefined | null
  ): Date | "TBD" | null =>
    deadline
      ? deadline === "TBD"
        ? "TBD"
        : moment.tz(deadline.toString(), ianaTimezone).toDate()
      : null;

  function formatDeadline(
    deadline: Date | string | undefined | null
  ): JSX.Element {
    if (deadline === "TBD") {
      return <span>TBD</span>;
    }

    const date = moment.tz(deadline, ianaTimezone).toDate();
    const shanghaiTime = formatInTimeZone(
      date,
      "Asia/Shanghai",
      "yyyy-MM-dd HH:mm:ss"
    );
    const originalTime = formatInTimeZone(
      date,
      ianaTimezone,
      "yyyy-MM-dd HH:mm:ss"
    );
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{shanghaiTime} Asia/Shanghai</span>
          </TooltipTrigger>
          <TooltipContent>
            {originalTime} {ianaTimezone} ({conf.timezone})
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const passed = isDeadlinePassed(conf);
  return (
    <div
      key={conf.id}
      className={`flex flex-row gap-4 relative ${passed ? "opacity-70" : ""}`}
    >
      {passed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-340">
            <span className="text-3xl font-bold text-red-500 opacity-50">
              PASSED
            </span>
          </div>
        </div>
      )}
      <div className="w-1/2 flex justify-between items-start">
        <div className="w-full flex flex-col">
          <div className="flex flex-row flex-wrap gap-4 items-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className={`font-semibold ${
                      passed ? "text-gray-500 dark:text-gray-400" : ""
                    }`}
                  >
                    {confSeries.title.toUpperCase() + " " + conf.year}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{confSeries.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p
              className={`text-sm ${
                passed
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {conf.date}
            </p>
          </div>
          <p
            className={`text-sm ${
              passed
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {conf.place}
          </p>
          <div className="flex flex-row gap-1 text-sm">
            <p
              className={`${
                passed
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Website:
            </p>
            <a
              href={conf.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`overflow-hidden text-ellipsis whitespace-nowrap ${
                passed
                  ? "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  : "text-blue-600 dark:text-blue-400 hover:underline"
              }`}
            >
              {conf.link}
            </a>
          </div>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-4">
        {conf.timeline.slice(0, 1).map((timeline: Timeline, idx: number) => {
          const deadline = toDate(timeline.deadline);
          const abstractDeadline = toDate(timeline.abstract_deadline);
          return (
            <div key={idx} className="flex flex-col gap-2 text-sm">
              <div className="flex flex-col gap-1">
                {isValid(abstractDeadline) && !isPast(abstractDeadline!) ? (
                  <Countdown
                    deadline={abstractDeadline! as Date}
                    type="abstract"
                  />
                ) : isValid(deadline) && !isPast(deadline!) ? (
                  <Countdown deadline={deadline! as Date} type="paper" />
                ) : (
                  <div />
                )}
              </div>
              {abstractDeadline && (
                <div className="flex flex-col gap-1">
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row flex-wrap gap-1">
                      Abstract Deadline: {formatDeadline(abstractDeadline!)}
                    </div>
                  </div>
                </div>
              )}
              {deadline && (
                <div className="flex flex-col gap-1">
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row flex-wrap gap-1">
                      Paper Deadline: {formatDeadline(deadline!)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
