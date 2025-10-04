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
import { formatInTimeZone } from "date-fns-tz";
import moment from "moment-timezone";
import { JSX, useState } from "react";
import { getIANATimezone } from "../lib/date";
import { ConfEdition, Conference, Timeline } from "../types/api";
import Countdown from "./Countdown";
import DateTimePicker from "./DateTimePicker";

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

  // Date and time picker states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("10:30:00");

  // Helper functions to convert between datetime-local and date/time formats
  const parseNotificationToDateTime = (notification: string) => {
    if (!notification) return { date: undefined, time: "10:30:00" };
    const date = new Date(notification);
    const time = date.toTimeString().slice(0, 8);
    return { date, time };
  };

  const combineDateTime = (date: Date | undefined, time: string) => {
    if (!date) return "";
    const [hours, minutes, seconds] = time.split(":");
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    return combined.toISOString().slice(0, 19);
  };

  const handleSaveNotification = async () => {
    setIsSaving(true);
    try {
      const datetimeValue = combineDateTime(selectedDate, selectedTime);
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confEditionId: conf.id,
          notification: datetimeValue || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save notification time");
      }

      setNotification(datetimeValue);
      setPopoverOpen(false);
    } catch (error) {
      console.error("Error saving notification time:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotification(conf.timeline[0]?.notification || "");
    const { date, time } = parseNotificationToDateTime(
      conf.timeline[0]?.notification || ""
    );
    setSelectedDate(date);
    setSelectedTime(time);
    setPopoverOpen(false);
  };

  const handleEditStart = () => {
    const { date, time } = parseNotificationToDateTime(notification);
    setSelectedDate(date);
    setSelectedTime(time);
    setPopoverOpen(true);
  };

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
            <div className="flex flex-row gap-1">
              <span className="font-mono font-bold">{shanghaiTime}</span>
              {/* <span className="hidden sm:block">Asia/Shanghai</span> */}
            </div>
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
                {abstractDeadline && (
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row gap-1">
                      <span className="w-32 text-right font-medium">
                        Abstract Deadline:
                      </span>
                      <span className="break-all">
                        {formatDeadline(abstractDeadline!)}
                      </span>
                    </div>
                  </div>
                )}
                {deadline && (
                  <div
                    className={`${
                      passed
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex flex-row gap-1">
                      <span className="w-32 text-right font-medium">
                        Paper Deadline:
                      </span>
                      <span className="break-all">
                        {formatDeadline(deadline!)}
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
                    <span className="w-32 text-right font-medium">
                      Notification:
                    </span>
                    <div className="flex flex-row gap-2 items-center">
                      {/* <span>{notification || "TBD"}</span> */}
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <div
                            onClick={handleEditStart}
                            className="cursor-pointer hover:underline break-all"
                          >
                            {formatDeadline(notification || "TBD")}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="center">
                          <DateTimePicker
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            isSaving={isSaving}
                            onDateChange={setSelectedDate}
                            onTimeChange={setSelectedTime}
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
