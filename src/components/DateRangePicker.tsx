
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
  ranges?: DateRange[];
  onChange?: (ranges: DateRange[]) => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date) => void;
  onEndDateChange?: (date: Date) => void;
  className?: string;
}

const DateRangePicker = ({ 
  ranges, 
  onChange, 
  startDate, 
  endDate,
  onStartDateChange,
  onEndDateChange,
  className 
}: DateRangePickerProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);

  // If we're using the single date range mode
  if (startDate !== undefined && endDate !== undefined && onStartDateChange && onEndDateChange) {
    return (
      <div className={cn("flex gap-2", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && onStartDateChange(date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="p-3 border-t border-border">
              <p className="text-sm">Start date: {format(startDate, "MMM d, yyyy")}</p>
            </div>
          </PopoverContent>
        </Popover>
        <span className="flex items-center">-</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(endDate, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && onEndDateChange(date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              disabled={(date) => date < startDate}
            />
            <div className="p-3 border-t border-border">
              <p className="text-sm">End date: {format(endDate, "MMM d, yyyy")}</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // For the multiple ranges mode
  const handleSelect = (date: Date | undefined) => {
    if (!date || !ranges || !onChange) return;

    if (!tempStartDate) {
      setTempStartDate(date);
    } else if (!tempEndDate && date >= tempStartDate) {
      setTempEndDate(date);
      const newRange: DateRange = {
        id: crypto.randomUUID(),
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
    if (!ranges || !onChange) return;
    const newRanges = [...ranges];
    newRanges.splice(index, 1);
    onChange(newRanges);
  };

  if (!ranges || !onChange) {
    return null;
  }

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
