
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParameterSet, RatePlan, RoomType, SupplementValue, ChargeType, AgeRange, OccupancyPricing } from "@/models/SupplementTypes";
import ParameterBuilder from "./ParameterBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash } from "lucide-react";

interface ValueFormProps {
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  onAdd: (value: SupplementValue) => void;
}

const ValueForm = ({ roomTypes, ratePlans, onAdd }: ValueFormProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [chargeType, setChargeType] = useState<ChargeType>("per-room");
  const [description, setDescription] = useState("");
  const [parameters, setParameters] = useState<ParameterSet | null>(null);
  
  // Per-room amounts
  const [baseAmount, setBaseAmount] = useState("");
  const [extraAdultAmount, setExtraAdultAmount] = useState("");
  const [extraChildAmount, setExtraChildAmount] = useState("");
  const [extraInfantAmount, setExtraInfantAmount] = useState("");
  
  // Per-adult-child amounts
  const [adultAmount, setAdultAmount] = useState("");
  const [childAmount, setChildAmount] = useState("");
  const [infantAmount, setInfantAmount] = useState("");
  const [childAgeRanges, setChildAgeRanges] = useState<AgeRange[]>([]);
  
  // Per-occupant pricing
  const [occupancyPricing, setOccupancyPricing] = useState<OccupancyPricing[]>([
    { id: crypto.randomUUID(), occupantCount: 1, amount: 0 },
    { id: crypto.randomUUID(), occupantCount: 2, amount: 0 }
  ]);

  // Initialize parameters with all roomTypes and ratePlans selected
  useEffect(() => {
    setParameters({
      id: crypto.randomUUID(),
      dateRanges: [],
      roomTypes: [...roomTypes],
      ratePlans: [...ratePlans],
      chargeType: "per-room",
      daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
  }, [roomTypes, ratePlans]);

  const handleAddValue = () => {
    if (chargeType === "per-room" && !baseAmount) return;
    if (chargeType === "per-adult-child" && !adultAmount) return;
    if (chargeType === "per-occupant" && occupancyPricing.length === 0) return;
    if (!parameters) return;

    let updatedParameters = { ...parameters, chargeType };
    
    // Add description if provided
    if (description.trim()) {
      updatedParameters.description = description;
    }
    
    // Add charge type specific amounts
    if (chargeType === "per-room") {
      updatedParameters.roomAmounts = {
        baseAmount: parseFloat(baseAmount),
        extraAdultAmount: extraAdultAmount ? parseFloat(extraAdultAmount) : 0,
        extraChildAmount: extraChildAmount ? parseFloat(extraChildAmount) : 0,
        extraInfantAmount: extraInfantAmount ? parseFloat(extraInfantAmount) : 0
      };
    } else if (chargeType === "per-adult-child") {
      updatedParameters.occupantAmounts = {
        adultAmount: parseFloat(adultAmount),
        childAmount: childAmount ? parseFloat(childAmount) : 0,
        infantAmount: infantAmount ? parseFloat(infantAmount) : 0,
        childAgeRanges: [...childAgeRanges],
        occupancyPricing: []
      };
    } else { // per-occupant
      updatedParameters.occupantAmounts = {
        adultAmount: 0,
        childAmount: 0,
        infantAmount: 0,
        childAgeRanges: [],
        occupancyPricing: [...occupancyPricing].filter(p => p.amount > 0)
      };
    }

    let valueAmount = 0;
    if (chargeType === "per-room") {
      valueAmount = parseFloat(baseAmount);
    } else if (chargeType === "per-adult-child") {
      valueAmount = parseFloat(adultAmount);
    } else if (chargeType === "per-occupant" && occupancyPricing.length > 0) {
      valueAmount = occupancyPricing[0].amount;
    }

    const value: SupplementValue = {
      id: crypto.randomUUID(),
      amount: valueAmount,
      currency,
      parameters: updatedParameters,
    };

    onAdd(value);
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCurrency("USD");
    setChargeType("per-room");
    setBaseAmount("");
    setExtraAdultAmount("");
    setExtraChildAmount("");
    setExtraInfantAmount("");
    setAdultAmount("");
    setChildAmount("");
    setInfantAmount("");
    setChildAgeRanges([]);
    setOccupancyPricing([
      { id: crypto.randomUUID(), occupantCount: 1, amount: 0 },
      { id: crypto.randomUUID(), occupantCount: 2, amount: 0 }
    ]);
    setParameters({
      id: crypto.randomUUID(),
      dateRanges: [],
      roomTypes: [...roomTypes],
      ratePlans: [...ratePlans],
      chargeType: "per-room",
      daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    });
  };

  const handleParametersChange = (newParameters: ParameterSet) => {
    setParameters(newParameters);
  };

  const addChildAgeRange = () => {
    setChildAgeRanges([
      ...childAgeRanges, 
      { id: crypto.randomUUID(), minAge: 0, maxAge: 0, amount: 0 }
    ]);
  };

  const updateChildAgeRange = (id: string, field: keyof AgeRange, value: number) => {
    setChildAgeRanges(childAgeRanges.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const removeChildAgeRange = (id: string) => {
    setChildAgeRanges(childAgeRanges.filter(range => range.id !== id));
  };

  const addOccupancyPricing = () => {
    const nextOccupantCount = Math.max(...occupancyPricing.map(p => p.occupantCount)) + 1;
    setOccupancyPricing([
      ...occupancyPricing,
      { id: crypto.randomUUID(), occupantCount: nextOccupantCount, amount: 0 }
    ]);
  };

  const updateOccupancyPricing = (id: string, field: keyof OccupancyPricing, value: number) => {
    setOccupancyPricing(occupancyPricing.map(pricing => 
      pricing.id === id ? { ...pricing, [field]: value } : pricing
    ));
  };

  const removeOccupancyPricing = (id: string) => {
    setOccupancyPricing(occupancyPricing.filter(pricing => pricing.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Mealplan Value</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description" className="text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-sm">
                Currency <span className="text-red-500">*</span>
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
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

          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-base font-medium">Charge Type</h3>
              <span className="text-red-500">*</span>
            </div>
            
            <Tabs 
              defaultValue="per-room" 
              value={chargeType}
              onValueChange={(value) => setChargeType(value as ChargeType)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="per-room">Per Room</TabsTrigger>
                <TabsTrigger value="per-adult-child">Per Adult/Child</TabsTrigger>
                <TabsTrigger value="per-occupant">Per Occupant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="per-room" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseAmount" className="flex items-center">
                      Base Amount <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex mt-1">
                      <Input
                        id="baseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={baseAmount}
                        onChange={(e) => setBaseAmount(e.target.value)}
                        className="rounded-r-none"
                        required
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="extraAdultAmount">Extra Adult Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="extraAdultAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={extraAdultAmount}
                        onChange={(e) => setExtraAdultAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="extraChildAmount">Extra Child Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="extraChildAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={extraChildAmount}
                        onChange={(e) => setExtraChildAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="extraInfantAmount">Extra Infant Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="extraInfantAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={extraInfantAmount}
                        onChange={(e) => setExtraInfantAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="per-adult-child" className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adultAmount" className="flex items-center">
                      Adult Amount <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="flex mt-1">
                      <Input
                        id="adultAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={adultAmount}
                        onChange={(e) => setAdultAmount(e.target.value)}
                        className="rounded-r-none"
                        required
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="childAmount">Child Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="childAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={childAmount}
                        onChange={(e) => setChildAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="infantAmount">Infant Amount</Label>
                    <div className="flex mt-1">
                      <Input
                        id="infantAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={infantAmount}
                        onChange={(e) => setInfantAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                        {currency}
                      </div>
                    </div>
                  </div>
                </div>
                
                {childAgeRanges.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Child Age Ranges</Label>
                    </div>
                    {childAgeRanges.map((range) => (
                      <div key={range.id} className="flex items-center space-x-2">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`min-age-${range.id}`} className="sr-only">Min Age</Label>
                            <Input
                              id={`min-age-${range.id}`}
                              type="number"
                              min="0"
                              max="17"
                              placeholder="Min Age"
                              value={range.minAge || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'minAge', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`max-age-${range.id}`} className="sr-only">Max Age</Label>
                            <Input
                              id={`max-age-${range.id}`}
                              type="number"
                              min="0"
                              max="17"
                              placeholder="Max Age"
                              value={range.maxAge || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'maxAge', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount"
                              value={range.amount || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="rounded-r-none"
                            />
                            <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                              {currency}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChildAgeRange(range.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChildAgeRange}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Child Age Range
                </Button>
              </TabsContent>
              
              <TabsContent value="per-occupant" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Occupancy Based Pricing</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set different prices based on the number of occupants.
                  </p>
                  
                  {occupancyPricing.map((pricing) => (
                    <div key={pricing.id} className="flex items-center space-x-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`occupant-count-${pricing.id}`} className="text-sm">
                            {pricing.occupantCount === 1 ? "1 Occupant" : `${pricing.occupantCount} Occupants`}
                          </Label>
                          <div className="flex mt-1">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={pricing.amount || ""}
                              onChange={(e) => updateOccupancyPricing(pricing.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="rounded-r-none"
                            />
                            <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                              {currency}
                            </div>
                          </div>
                        </div>
                      </div>
                      {occupancyPricing.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOccupancyPricing(pricing.id)}
                          className="mt-6"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOccupancyPricing}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Occupants
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
            disabled={(chargeType === "per-room" && !baseAmount) || 
                     (chargeType === "per-adult-child" && !adultAmount) ||
                     (chargeType === "per-occupant" && occupancyPricing.every(p => !p.amount))}
          >
            Add another value
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueForm;
