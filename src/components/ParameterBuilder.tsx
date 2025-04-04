
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ParameterSet, RoomType, RatePlan, DateRange } from "@/models/SupplementTypes";
import MultiSelect from "./MultiSelect";
import DateRangePicker from "./DateRangePicker";
import { Trash, Plus, Calendar, Clock3 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface ParameterBuilderProps {
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  onChange: (parameters: ParameterSet) => void;
  value?: ParameterSet;
}

const days: { label: string; value: DayOfWeek }[] = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

const ParameterBuilder = ({ roomTypes, ratePlans, onChange, value }: ParameterBuilderProps) => {
  const [parameters, setParameters] = useState<ParameterSet>({
    id: crypto.randomUUID(),
    dateRanges: [],
    roomTypes: [...roomTypes],
    ratePlans: [...ratePlans],
    chargeType: "per-room",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    leadTime: 0
  });

  useEffect(() => {
    if (value) {
      setParameters(value);
    }
  }, [value]);

  useEffect(() => {
    onChange(parameters);
  }, [parameters, onChange]);

  const addDateRange = () => {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    
    const newRange: DateRange = {
      id: crypto.randomUUID(),
      startDate: now,
      endDate: nextMonth,
    };
    
    setParameters({
      ...parameters,
      dateRanges: [...parameters.dateRanges, newRange],
    });
  };

  const updateDateRange = (id: string, field: keyof DateRange, value: Date) => {
    setParameters({
      ...parameters,
      dateRanges: parameters.dateRanges.map(range =>
        range.id === id ? { ...range, [field]: value } : range
      ),
    });
  };

  const removeDateRange = (id: string) => {
    setParameters({
      ...parameters,
      dateRanges: parameters.dateRanges.filter(range => range.id !== id),
    });
  };

  const toggleDayOfWeek = (day: DayOfWeek) => {
    const currentDays = parameters.daysOfWeek || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setParameters({
      ...parameters,
      daysOfWeek: updatedDays,
    });
  };

  const handleLeadTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setParameters({
      ...parameters,
      leadTime: value,
    });
  };

  const handleRoomTypesChange = (selectedRoomTypes: RoomType[]) => {
    setParameters({
      ...parameters,
      roomTypes: selectedRoomTypes,
    });
  };

  const handleRatePlansChange = (selectedRatePlans: RatePlan[]) => {
    setParameters({
      ...parameters,
      ratePlans: selectedRatePlans,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Label className="text-sm">Room Types</Label>
            <MultiSelect
              items={roomTypes}
              selectedItems={parameters.roomTypes}
              onChange={handleRoomTypesChange}
              placeholder="Select room types..."
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm">Rate Plans</Label>
            <MultiSelect
              items={ratePlans}
              selectedItems={parameters.ratePlans}
              onChange={handleRatePlansChange}
              placeholder="Select rate plans..."
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm flex items-center gap-1">
            <Calendar size={16} /> Date Ranges
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addDateRange} className="h-7 px-2">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        
        {parameters.dateRanges.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No date restrictions (applies to all dates)</div>
        ) : (
          <div className="space-y-2">
            {parameters.dateRanges.map((range) => (
              <div key={range.id} className="flex gap-2 items-center">
                <DateRangePicker
                  startDate={range.startDate}
                  endDate={range.endDate}
                  onStartDateChange={(date) => updateDateRange(range.id as string, 'startDate', date)}
                  onEndDateChange={(date) => updateDateRange(range.id as string, 'endDate', date)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDateRange(range.id as string)}
                  className="h-8 w-8"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <Label className="text-sm flex items-center gap-1 mb-2">
          <Clock3 size={16} /> Days of Week
        </Label>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={parameters.daysOfWeek?.includes(day.value)}
                onCheckedChange={() => toggleDayOfWeek(day.value)}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {day.label.substring(0, 3)}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="leadTime" className="text-sm flex items-center gap-1">
            <Clock3 size={16} /> Lead Time (days)
          </Label>
          <Input
            id="leadTime"
            type="number"
            min="0"
            max="500"
            placeholder="0"
            value={parameters.leadTime || ''}
            onChange={handleLeadTimeChange}
            className="max-w-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ParameterBuilder;
