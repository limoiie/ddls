import moment from "moment";
import { ConfEdition, Timeline } from "../types/api";

export function getIANATimezone(timezone: string): string {
  // Map common timezone abbreviations to IANA timezone names
  const timezoneMap: { [key: string]: string } = {
    AoE: "Etc/GMT+12",
    "UTC-12": "Etc/GMT+12",
    "UTC-11": "Pacific/Midway",
    "UTC-10": "Pacific/Honolulu",
    "UTC-9": "America/Anchorage",
    "UTC-8": "America/Los_Angeles",
    "UTC-7": "America/Denver",
    "UTC-6": "America/Chicago",
    "UTC-5": "America/New_York",
    "UTC-4": "America/Halifax",
    "UTC-3": "America/Sao_Paulo",
    "UTC-2": "Atlantic/South_Georgia",
    "UTC-1": "Atlantic/Azores",
    UTC: "UTC",
    "UTC+1": "Europe/London",
    "UTC+2": "Europe/Paris",
    "UTC+3": "Europe/Moscow",
    "UTC+4": "Asia/Dubai",
    "UTC+5": "Asia/Karachi",
    "UTC+5:30": "Asia/Kolkata",
    "UTC+6": "Asia/Dhaka",
    "UTC+7": "Asia/Bangkok",
    "UTC+8": "Asia/Shanghai",
    "UTC+9": "Asia/Tokyo",
    "UTC+10": "Australia/Sydney",
    "UTC+11": "Pacific/Guadalcanal",
    "UTC+12": "Pacific/Auckland",
  };

  // If the timezone is already an IANA timezone name, return it
  if (timezone.includes("/")) {
    return timezone;
  }

  // Convert UTC offset to IANA timezone
  return timezoneMap[timezone] || "UTC";
}

export function isSubmissionPassed(conf: ConfEdition) {
  return conf.timeline.every((timeline) =>
    isTimelinePassed(timeline, conf.timezone)
  );
}

export function isTimelinePassed(timeline: Timeline, timezone: string) {
  // Empty deadline means passed
  return (
    (!timeline.deadline && !timeline.abstract_deadline) ||
    isDatePassed(
      timeline.deadline || timeline.abstract_deadline || "",
      timezone
    )
  );
}

export function isDatePassed(date: string, timezone: string) {
  if (date === "TBD") {
    return false;
  }
  return parseMoment(date, timezone).isBefore(moment());
}

export function isFixedFutureDate(
  date: string | undefined | null,
  timezone: string
) {
  if (!date || date === "TBD") {
    return false;
  }
  return parseMoment(date, timezone).isAfter(moment());
}

export function parseMoment(date: string, timezone: string) {
  const ianaTimezone = getIANATimezone(timezone);
  return moment.tz(date, ianaTimezone);
}
