
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
      roomTypes: [],
      ratePlans: [],
      chargeType: "per-room",
    }
  );

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

  const handleChargeTypeChange = (chargeType: ChargeType) => {
    updateParameters({ chargeType });
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

        <Separator />

        <div className="space-y-2">
          <Label>Charge Type</Label>
          <RadioGroup
            value={parameters.chargeType}
            onValueChange={(value) => handleChargeTypeChange(value as ChargeType)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="per-room" id="per-room" />
              <Label htmlFor="per-room" className="font-normal">Per Room</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="per-adult" id="per-adult" />
              <Label htmlFor="per-adult" className="font-normal">Per Adult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="per-occupant" id="per-occupant" />
              <Label htmlFor="per-occupant" className="font-normal">Per Occupant</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterBuilder;
