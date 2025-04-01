
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChargeType, DateRange, ParameterSet, RatePlan, RoomType } from "@/models/SupplementTypes";
import DateRangePicker from "./DateRangePicker";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  const handleRoomTypeToggle = (roomType: RoomType) => {
    const isSelected = parameters.roomTypes.some(rt => rt.id === roomType.id);
    let updatedRoomTypes: RoomType[];
    
    if (isSelected) {
      updatedRoomTypes = parameters.roomTypes.filter(rt => rt.id !== roomType.id);
    } else {
      updatedRoomTypes = [...parameters.roomTypes, roomType];
    }
    
    updateParameters({ roomTypes: updatedRoomTypes });
  };

  const handleRatePlanToggle = (ratePlan: RatePlan) => {
    const isSelected = parameters.ratePlans.some(rp => rp.id === ratePlan.id);
    let updatedRatePlans: RatePlan[];
    
    if (isSelected) {
      updatedRatePlans = parameters.ratePlans.filter(rp => rp.id !== ratePlan.id);
    } else {
      updatedRatePlans = [...parameters.ratePlans, ratePlan];
    }
    
    updateParameters({ ratePlans: updatedRatePlans });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Room Types</Label>
            <div className="space-y-2">
              {roomTypes.map((roomType) => (
                <div key={roomType.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`room-${roomType.id}`}
                    checked={parameters.roomTypes.some(rt => rt.id === roomType.id)}
                    onCheckedChange={() => handleRoomTypeToggle(roomType)}
                  />
                  <Label
                    htmlFor={`room-${roomType.id}`}
                    className="cursor-pointer"
                  >
                    {roomType.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rate Plans</Label>
            <div className="space-y-2">
              {ratePlans.map((ratePlan) => (
                <div key={ratePlan.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`rate-${ratePlan.id}`}
                    checked={parameters.ratePlans.some(rp => rp.id === ratePlan.id)}
                    onCheckedChange={() => handleRatePlanToggle(ratePlan)}
                  />
                  <Label
                    htmlFor={`rate-${ratePlan.id}`}
                    className="cursor-pointer"
                  >
                    {ratePlan.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Date Ranges</Label>
          <DateRangePicker 
            ranges={parameters.dateRanges} 
            onChange={handleDateRangeChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterBuilder;
