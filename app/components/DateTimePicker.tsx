import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { getIANATimezone } from "../lib/date";

interface DateTimePickerProps {
  defaultDate: Date | undefined;
  defaultTime: string;
  timeZone: string;
  isSaving: boolean;
  onSave: (datetime: string) => void;
  onCancel: () => void;
  children: ReactNode; // Trigger content shown inline where the picker is used
}

export default function DateTimePicker({
  defaultDate,
  defaultTime,
  timeZone,
  isSaving,
  onSave,
  onCancel,
  children,
}: DateTimePickerProps) {
  const [outerOpen, setOuterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [time, setTime] = useState<string>(defaultTime);

  function combineDateTime(date: Date | undefined, time: string): string {
    if (!date) return "";
    const [hours, minutes, seconds] = time.split(":");
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = hours.padStart(2, "0");
    const minute = minutes.padStart(2, "0");
    const second = seconds.padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  function onCancelClicked() {
    setDate(defaultDate);
    setTime(defaultTime);
    onCancel();
    setDatePickerOpen(false);
    setOuterOpen(false);
  }

  return (
    <Popover open={outerOpen} onOpenChange={setOuterOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="center">
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <div className="h-15 flex flex-col items-center justify-end pb-1.5">
              <span className="text-sm">{getIANATimezone(timeZone)}</span>
            </div>
            <div className="flex flex-col gap-2 h-8">
              <Label htmlFor="date-picker" className="px-1 text-sm">
                Date
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-32 justify-between font-normal text-sm h-8"
                    disabled={isSaving}
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date}
                    captionLayout="dropdown"
                    startMonth={new Date(new Date().getFullYear() - 5, 0)}
                    endMonth={new Date(new Date().getFullYear() + 5, 0)}
                    onSelect={(date) => {
                      setDate(date);
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time-picker" className="px-1 text-sm">
                Time
              </Label>
              <Input
                type="time"
                id="time-picker"
                step="1"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-24 h-8 text-sm"
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <Button
              size="sm"
              onClick={() => {
                onSave(combineDateTime(date, time));
                setOuterOpen(false);
              }}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelClicked}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
