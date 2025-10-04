import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isPast, isValid } from "date-fns";
import moment from "moment-timezone";
import { JSX, useState } from "react";
import { getIANATimezone, parseDate } from "../lib/date";
import { ConfEdition, Conference, Timeline } from "../types/api";
import Countdown from "./Countdown";
import DateTimePicker from "./DateTimePicker";
import DateTimeline from "./DateTimeline";

interface ConferenceEditionProps {
  conf: ConfEdition;
  confSeries: Conference;
}

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

export default function ConferenceEdition({
  conf,
  confSeries,
}: ConferenceEditionProps) {
  const ianaTimezone = getIANATimezone(conf.timezone);
  const [notification, setNotification] = useState(
    conf.timeline[0]?.notification || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Helper functions to convert between datetime-local and date/time formats
  const parseNotificationToDateTime = (notification: string) => {
    if (!notification) return { date: undefined, time: "" };
    const date = new Date(notification);
    const time = date.toTimeString().slice(0, 8);
    return { date, time };
  };

  const handleSaveNotification = async (datetime: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confEditionId: conf.id,
          notification: datetime || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save notification time");
      }

      setNotification(datetime);
      setPopoverOpen(false);
    } catch (error) {
      console.error("Error saving notification time:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPopoverOpen(false);
  };

  const handleEditStart = () => {
    setPopoverOpen(true);
  };

  function formatDeadline(
    deadline: Date | string | undefined | null,
    label: string
  ): JSX.Element {
    const isPassed =
      deadline &&
      deadline !== "TBD" &&
      isPast(moment.tz(deadline, ianaTimezone).toDate());
    return (
      <div
        className={`flex flex-row gap-1 ${
          isPassed ? "text-gray-400 dark:text-gray-500 line-through" : ""
        }`}
      >
        <span className={`w-32 text-right font-medium`}>{label}:</span>
        <DateTimeline
          deadline={deadline}
          ianaTimezone={ianaTimezone}
          timezone={conf.timezone}
        />
      </div>
    );
  }

  const passed = isDeadlinePassed(conf);
  return (
    <div
      key={conf.id}
      className={`flex flex-col lg:flex-row gap-4 relative ${
        passed ? "opacity-70" : ""
      }`}
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
      <div className="w-full lg:w-1/2 flex justify-between items-start">
        <div className="w-full flex flex-col">
          <div className="flex flex-row gap-4 items-start justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className={`font-semibold whitespace-nowrap ${
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
            <div className="flex flex-col items-end gap-1">
              <p
                className={`text-sm ${
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {conf.date}
              </p>
              <p
                className={`text-sm whitespace-nowrap ${
                  passed
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {conf.place}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 text-sm">
            <p
              className={`hidden sm:block ${
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
              className={`break-all ${
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
      <div className="w-full lg:w-1/2 flex flex-col gap-4 items-start">
        {conf.timeline.slice(0, 1).map((timeline: Timeline, idx: number) => {
          const deadlineDate = parseDate(timeline.deadline, conf.timezone);
          const abstractDeadlineDate = parseDate(
            timeline.abstract_deadline,
            conf.timezone
          );
          const notificationDate = parseDate(notification, conf.timezone);
          return (
            <div key={idx} className="flex flex-col gap-2 text-sm">
              <div className="flex flex-col gap-1">
                {isValid(abstractDeadlineDate) &&
                !isPast(abstractDeadlineDate!) ? (
                  <Countdown
                    deadline={abstractDeadlineDate! as Date}
                    label="Abstract"
                    className="text-xs sm:text-sm"
                  />
                ) : isValid(deadlineDate) && !isPast(deadlineDate!) ? (
                  <Countdown
                    deadline={deadlineDate! as Date}
                    label="Paper"
                    className="text-xs sm:text-sm"
                  />
                ) : (
                  <div />
                )}
                {abstractDeadlineDate && (
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row gap-1">
                      <span className="break-all">
                        {formatDeadline(
                          abstractDeadlineDate!,
                          "Abstract Deadline"
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {deadlineDate && (
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row gap-1">
                      <span className="break-all">
                        {formatDeadline(deadlineDate!, "Paper Deadline")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notification Time Section */}
                <div
                  className={`${
                    passed
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <div className="flex flex-row gap-1 items-start sm:items-center">
                    <div className="flex flex-row gap-2 items-center">
                      {/* <span>{notification || "TBD"}</span> */}
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <div
                            onClick={handleEditStart}
                            className="cursor-pointer hover:underline break-all"
                          >
                            {formatDeadline(
                              notificationDate || "TBD",
                              "Notification"
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="center">
                          <DateTimePicker
                            defaultDate={
                              parseNotificationToDateTime(notification).date
                            }
                            defaultTime={
                              parseNotificationToDateTime(notification).time
                            }
                            timeZone={conf.timezone}
                            isSaving={isSaving}
                            onSave={handleSaveNotification}
                            onCancel={handleCancel}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
