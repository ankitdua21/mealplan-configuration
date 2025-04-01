
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParameterSet, RatePlan, RoomType, SupplementValue, ChargeType } from "@/models/SupplementTypes";
import ParameterBuilder from "./ParameterBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ValueFormProps {
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  onAdd: (value: SupplementValue) => void;
}

const ValueForm = ({ roomTypes, ratePlans, onAdd }: ValueFormProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [parameters, setParameters] = useState<ParameterSet | null>(null);

  // Initialize parameters with all roomTypes and ratePlans selected
  useEffect(() => {
    setParameters({
      id: crypto.randomUUID(),
      dateRanges: [],
      roomTypes: [...roomTypes],
      ratePlans: [...ratePlans],
      chargeType: "per-room" as ChargeType,
    });
  }, [roomTypes, ratePlans]);

  const handleAddValue = () => {
    if (!amount || !parameters) return;

    const value: SupplementValue = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      currency,
      parameters: parameters,
    };

    onAdd(value);
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setCurrency("USD");
    setParameters({
      id: crypto.randomUUID(),
      dateRanges: [],
      roomTypes: [...roomTypes],
      ratePlans: [...ratePlans],
      chargeType: "per-room" as ChargeType,
    });
  };

  const handleParametersChange = (newParameters: ParameterSet) => {
    setParameters(newParameters);
  };

  const handleChargeTypeChange = (value: ChargeType) => {
    if (parameters) {
      setParameters({
        ...parameters,
        chargeType: value,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Mealplan Value</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="flex items-center">
              Amount <span className="text-red-500 ml-1">*</span>
            </Label>
          </div>
          
          <div className="flex items-center">
            <div className="flex">
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-r-none w-24"
                required
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-20 rounded-l-none border-l-0">
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <RadioGroup 
              value={parameters?.chargeType || "per-room"} 
              onValueChange={handleChargeTypeChange as (value: string) => void}
              className="flex space-x-4 ml-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="per-room" id="per-room" />
                <Label htmlFor="per-room" className="cursor-pointer">Per Room</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="per-adult" id="per-adult" />
                <Label htmlFor="per-adult" className="cursor-pointer">Per Adult</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="per-occupant" id="per-occupant" />
                <Label htmlFor="per-occupant" className="cursor-pointer">Per Occupant</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-4">
          <ParameterBuilder
            roomTypes={roomTypes}
            ratePlans={ratePlans}
            onChange={handleParametersChange}
            value={parameters || undefined}
          />
        </div>

        <div className="flex justify-start">
          <Button 
            onClick={handleAddValue}
            disabled={!amount || !parameters}
          >
            Add another value
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueForm;
