
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "@/models/SupplementTypes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DateRangePickerProps {
  ranges: DateRange[];
  onChange: (ranges: DateRange[]) => void;
}

const DateRangePicker = ({ ranges, onChange }: DateRangePickerProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!tempStartDate) {
      setTempStartDate(date);
    } else if (!tempEndDate && date >= tempStartDate) {
      setTempEndDate(date);
      const newRange: DateRange = {
        startDate: tempStartDate,
        endDate: date,
      };
      onChange([...ranges, newRange]);
      setTempStartDate(undefined);
      setTempEndDate(undefined);
      setIsSelecting(false);
    } else {
      setTempStartDate(date);
      setTempEndDate(undefined);
    }
  };

  const removeRange = (index: number) => {
    const newRanges = [...ranges];
    newRanges.splice(index, 1);
    onChange(newRanges);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ranges.map((range, index) => (
          <Badge
            key={index}
            variant="outline"
            className="flex items-center gap-1 py-1 px-2"
          >
            <span>
              {format(range.startDate, "MMM d, yyyy")} - {format(range.endDate, "MMM d, yyyy")}
            </span>
            <button
              type="button"
              onClick={() => removeRange(index)}
              className="ml-1 rounded-full text-red-500 hover:bg-red-50 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={isSelecting} onOpenChange={setIsSelecting}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setIsSelecting(true)}
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {tempStartDate ? (
              tempEndDate ? (
                `${format(tempStartDate, "MMM d, yyyy")} - ${format(tempEndDate, "MMM d, yyyy")}`
              ) : (
                `${format(tempStartDate, "MMM d, yyyy")} - Select end date`
              )
            ) : (
              "Add date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={tempEndDate || tempStartDate}
            onSelect={handleSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={(date) => {
              if (!tempStartDate) return false;
              return date < tempStartDate;
            }}
          />
          <div className="p-3 border-t border-border">
            {tempStartDate ? (
              <p className="text-sm">
                {tempEndDate ? (
                  `${format(tempStartDate, "MMM d, yyyy")} - ${format(tempEndDate, "MMM d, yyyy")}`
                ) : (
                  `${format(tempStartDate, "MMM d, yyyy")} - Select end date`
                )}
              </p>
            ) : (
              <p className="text-sm">Select start date</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
