import { Timeline } from "@/app/types/api";
import { isPast, isValid } from "date-fns";
import { useState } from "react";
import { getIANATimezone, parseDate } from "../lib/date";
import Countdown from "./Countdown";
import DateTimePicker from "./DateTimePicker";
import DateTimeline from "./DateTimeline";

interface TimelineCardProps {
  editionPassed: boolean;
  timeline: Timeline;
  timezone: string;
  defaultCollapsed?: boolean;
  defaultComment: string;
  onSaveNotification: (datetime: string) => Promise<void>;
}

export default function TimelineCard({
  editionPassed,
  timeline,
  timezone,
  onSaveNotification,
}: TimelineCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const deadlineDate = parseDate(timeline.deadline, timezone);
  const abstractDeadlineDate = parseDate(timeline.abstract_deadline, timezone);
  const [notification, setNotification] = useState(timeline.notification || "");

  const ianaTimezone = getIANATimezone(timezone);

  const handleSaveNotification = async (datetime: string) => {
    setIsSaving(true);
    try {
      await onSaveNotification(datetime);
      setNotification(datetime);
    } catch (error) {
      console.error("Error saving notification time:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {};
  function labeledDeadline(
    deadline: Date | string | undefined | null,
    label: string
  ) {
    const isDeadlinePassed =
      deadline &&
      deadline !== "TBD" &&
      typeof deadline !== "string" &&
      isValid(deadline) &&
      isPast(deadline);
    return (
      <div
        className={`flex flex-row gap-1 ${
          isDeadlinePassed
            ? "text-gray-400 dark:text-gray-500 line-through"
            : ""
        }`}
      >
        <span className={`w-32 text-right font-medium`}>{label}:</span>
        <DateTimeline
          deadline={deadline}
          ianaTimezone={ianaTimezone}
          timezone={timezone}
        />
      </div>
    );
  }

  function parseNotificationToDateTime(notificationValue: string) {
    if (!notificationValue)
      return { date: undefined as Date | undefined, time: "" };
    const date = new Date(notificationValue);
    const time = date.toTimeString().slice(0, 8);
    return { date, time };
  }

  const notificationDate = notification ? new Date(notification) : undefined;

  return (
    <div className="w-full flex flex-col gap-2 text-sm">
      <div className="flex flex-col gap-1">
        {abstractDeadlineDate &&
        abstractDeadlineDate !== "TBD" &&
        isValid(abstractDeadlineDate as Date) &&
        !isPast(abstractDeadlineDate as Date) ? (
          <Countdown
            deadline={abstractDeadlineDate as Date}
            label="Abstract"
            className="text-xs sm:text-sm"
          />
        ) : deadlineDate &&
          deadlineDate !== "TBD" &&
          isValid(deadlineDate as Date) &&
          !isPast(deadlineDate as Date) ? (
          <Countdown
            deadline={deadlineDate as Date}
            label="Paper"
            className="text-xs sm:text-sm"
          />
        ) : null}
      </div>
      <div
        className={`flex flex-col gap-1 items-end ${
          editionPassed
            ? "text-gray-400 dark:text-gray-500"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {abstractDeadlineDate && (
          <div>
            {labeledDeadline(abstractDeadlineDate!, "Abstract Deadline")}
          </div>
        )}
        {deadlineDate && (
          <div>{labeledDeadline(deadlineDate!, "Paper Deadline")}</div>
        )}
        <div>
          <DateTimePicker
            defaultDate={parseNotificationToDateTime(notification).date}
            defaultTime={parseNotificationToDateTime(notification).time}
            timeZone={timezone}
            isSaving={isSaving}
            onSave={handleSaveNotification}
            onCancel={handleCancel}
          >
            <div className="cursor-pointer hover:underline break-all">
              {labeledDeadline(notificationDate || "TBD", "Notification")}
            </div>
          </DateTimePicker>
        </div>
      </div>
    </div>
  );
}
