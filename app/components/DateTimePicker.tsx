import { useState } from "react";
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

interface DateTimePickerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  isSaving: boolean;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  isSaving,
  onDateChange,
  onTimeChange,
  onSave,
  onCancel,
}: DateTimePickerProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <div className="flex flex-col gap-2">
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
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : "Select date"}
                <ChevronDownIcon className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                onSelect={(date) => {
                  onDateChange(date);
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
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-24 h-8 text-sm"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
