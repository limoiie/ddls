import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isPast } from "date-fns";
import moment from "moment";
import { formatInTimeZone } from "date-fns-tz";

export default function DateTimeline({
  deadline,
  ianaTimezone,
  timezone,
}: {
  deadline: Date | string | undefined | null;
  ianaTimezone: string;
  timezone: string;
}) {
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
  const isPassed = isPast(date);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-row gap-1 ${
              isPassed ? "text-gray-400 dark:text-gray-500 line-through" : ""
            }`}
          >
            <span className="font-mono font-medium">
              {shanghaiTime.split(" ")[0]}
            </span>
            <span className="font-mono opacity-50">
              {shanghaiTime.split(" ")[1]}
            </span>
            {/* <span className="hidden sm:block">Asia/Shanghai</span> */}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col items-center">
            <div className="font-mono">{originalTime}</div>
            {ianaTimezone} ({timezone})
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
