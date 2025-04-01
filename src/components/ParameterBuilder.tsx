
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChargeType, DateRange, ParameterSet, RatePlan, RoomType } from "@/models/SupplementTypes";
import DateRangePicker from "./DateRangePicker";
import MultiSelect from "./MultiSelect";
import { Card, CardContent } from "@/components/ui/card";

interface ParameterBuilderProps {
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  onChange: (parameters: ParameterSet) => void;
  value?: ParameterSet;
}

const ParameterBuilder = ({
  roomTypes,
  ratePlans,
  onChange,
  value,
}: ParameterBuilderProps) => {
  const [parameters, setParameters] = useState<ParameterSet>(
    value || {
      id: crypto.randomUUID(),
      dateRanges: [],
      roomTypes: [...roomTypes], // Pre-select all room types
      ratePlans: [...ratePlans], // Pre-select all rate plans
      chargeType: "per-room" as ChargeType,
    }
  );

  // Initialize with all roomTypes and ratePlans when component mounts
  useEffect(() => {
    if (!value) {
      const initialParameters: ParameterSet = {
        id: crypto.randomUUID(),
        dateRanges: [],
        roomTypes: [...roomTypes],
        ratePlans: [...ratePlans],
        chargeType: "per-room" as ChargeType,
      };
      setParameters(initialParameters);
      onChange(initialParameters);
    }
  }, []);

  // Update if roomTypes or ratePlans arrays change
  useEffect(() => {
    // Only update if there are no selections yet
    if (parameters.roomTypes.length === 0 && roomTypes.length > 0) {
      updateParameters({ roomTypes: [...roomTypes] });
    }
    if (parameters.ratePlans.length === 0 && ratePlans.length > 0) {
      updateParameters({ ratePlans: [...ratePlans] });
    }
  }, [roomTypes, ratePlans]);

  // Update parameters when value prop changes
  useEffect(() => {
    if (value) {
      setParameters(value);
    }
  }, [value]);

  const updateParameters = (updates: Partial<ParameterSet>) => {
    const updatedParameters = { ...parameters, ...updates };
    setParameters(updatedParameters);
    onChange(updatedParameters);
  };

  const handleDateRangeChange = (dateRanges: DateRange[]) => {
    updateParameters({ dateRanges });
  };

  const handleRoomTypeChange = (roomTypes: RoomType[]) => {
    updateParameters({ roomTypes });
  };

  const handleRatePlanChange = (ratePlans: RatePlan[]) => {
    updateParameters({ ratePlans });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Date Ranges</Label>
          <DateRangePicker 
            ranges={parameters.dateRanges} 
            onChange={handleDateRangeChange} 
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Room Types</Label>
          <MultiSelect
            options={roomTypes}
            selected={parameters.roomTypes}
            onChange={handleRoomTypeChange}
            placeholder="Select room types..."
            emptyMessage="No room types found."
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Rate Plans</Label>
          <MultiSelect
            options={ratePlans}
            selected={parameters.ratePlans}
            onChange={handleRatePlanChange}
            placeholder="Select rate plans..."
            emptyMessage="No rate plans found."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterBuilder;
