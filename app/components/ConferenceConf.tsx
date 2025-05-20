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

interface ConferenceConfProps {
  conf: ConferenceEvent;
  confSeries: Conference;
}

function areAllDeadlinesPassed(confSeries: Conference): boolean {
  return confSeries.confs.every((conf) => {
    const ianaTimezone = getIANATimezone(conf.timezone);
    const deadlineDate = moment
      .tz(
        conf.timeline[0].deadline || conf.timeline[0].abstract_deadline || "",
        ianaTimezone
      )
      .toDate();
    return deadlineDate.getTime() < Date.now();
  });
}

function formatDeadline(deadline: string, timezone: string): JSX.Element {
  const ianaTimezone = getIANATimezone(timezone);
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
          {originalTime} {ianaTimezone} ({timezone})
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ConferenceConf({
  conf,
  confSeries,
}: ConferenceConfProps) {
  const isOutdated = (deadline: Date | string | number | undefined) => {
    if (!deadline) return true;
    const ianaTimezone = getIANATimezone(conf.timezone);
    const date = moment.tz(deadline.toString(), ianaTimezone).toDate();
    return !isValid(date) || isPast(date);
  };
  const allDeadlinesPassed = areAllDeadlinesPassed(confSeries);
  return (
    <div
      key={conf.id}
      className={`flex flex-row gap-4 ${
        allDeadlinesPassed ? "opacity-50" : ""
      }`}
    >
      <div className="w-1/2 flex justify-between items-start">
        <div>
          <div className="flex flex-row gap-4 items-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className={`font-semibold ${
                      allDeadlinesPassed
                        ? "text-gray-500 dark:text-gray-400"
                        : ""
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
                allDeadlinesPassed
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {conf.date}
            </p>
          </div>
          <p
            className={`text-sm ${
              allDeadlinesPassed
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {conf.place}
          </p>
          <div className="flex flex-row gap-1 text-sm">
            <p
              className={`${
                allDeadlinesPassed
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
              className={`${
                allDeadlinesPassed
                  ? "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  : "text-blue-600 dark:text-blue-400 hover:underline"
              }`}
            >
              {conf.link}
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {conf.timeline.slice(0, 1).map((timeline: Timeline, idx: number) => (
          <div key={idx} className="flex flex-col gap-2 text-sm">
            {!isOutdated(timeline.abstract_deadline) ? (
              <div className="flex flex-col gap-1">
                <Countdown
                  deadline={timeline.abstract_deadline!}
                  type="abstract"
                />
                <p
                  className={`${
                    allDeadlinesPassed
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <div className="flex flex-row gap-1">
                    Abstract Deadline:{" "}
                    {formatDeadline(timeline.abstract_deadline!, conf.timezone)}
                  </div>
                </p>
              </div>
            ) : !isOutdated(timeline.deadline) ? (
              <div className="flex flex-col gap-1">
                <Countdown deadline={timeline.deadline!} type="paper" />
                <p
                  className={`${
                    allDeadlinesPassed
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <div className="flex flex-row gap-1">
                    Paper Deadline:{" "}
                    {formatDeadline(timeline.deadline!, conf.timezone)}
                  </div>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p
                  className={`${
                    allDeadlinesPassed
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <div className="flex flex-row gap-1">
                    Paper Deadline:{" "}
                    {formatDeadline(timeline.deadline!, conf.timezone)}
                  </div>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
