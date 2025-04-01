
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParameterSet, RatePlan, RoomType, SupplementValue, ChargeType } from "@/models/SupplementTypes";
import ParameterBuilder from "./ParameterBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Mealplan Value</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex">
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-r-none"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24 rounded-l-none border-l-0">
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
        </div>

        <div className="space-y-4">
          <ParameterBuilder
            roomTypes={roomTypes}
            ratePlans={ratePlans}
            onChange={handleParametersChange}
            value={parameters || undefined}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleAddValue}
            disabled={!amount || !parameters}
          >
            Add Value
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueForm;
