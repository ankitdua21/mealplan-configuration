
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
import { Plus, Trash, Info } from "lucide-react";

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
  
  // Per-occupant amounts
  const [adultAmount, setAdultAmount] = useState("");
  const [childAmount, setChildAmount] = useState("");
  const [infantAmount, setInfantAmount] = useState("");
  const [childAgeRanges, setChildAgeRanges] = useState<AgeRange[]>([]);
  const [occupancyPricing, setOccupancyPricing] = useState<OccupancyPricing[]>([]);

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
    if (chargeType === "per-occupant" && !adultAmount) return;
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
    } else {
      updatedParameters.occupantAmounts = {
        adultAmount: parseFloat(adultAmount),
        childAmount: childAmount ? parseFloat(childAmount) : 0,
        infantAmount: infantAmount ? parseFloat(infantAmount) : 0,
        childAgeRanges: [...childAgeRanges],
        occupancyPricing: [...occupancyPricing]
      };
    }

    const value: SupplementValue = {
      id: crypto.randomUUID(),
      amount: chargeType === "per-room" ? parseFloat(baseAmount) : parseFloat(adultAmount),
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
    setOccupancyPricing([]);
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
      { id: crypto.randomUUID(), minAge: 0, maxAge: 17, amount: 0 }
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
    setOccupancyPricing([
      ...occupancyPricing,
      { id: crypto.randomUUID(), occupantCount: occupancyPricing.length + 1, amount: 0 }
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
                Value Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description for this value"
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
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="per-room">Per Room</TabsTrigger>
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
              
              <TabsContent value="per-occupant" className="mt-4 space-y-6">
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
                              value={range.minAge}
                              onChange={(e) => updateChildAgeRange(range.id, 'minAge', parseInt(e.target.value))}
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
                              value={range.maxAge}
                              onChange={(e) => updateChildAgeRange(range.id, 'maxAge', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount"
                              value={range.amount}
                              onChange={(e) => updateChildAgeRange(range.id, 'amount', parseFloat(e.target.value))}
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
                
                {occupancyPricing.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Occupancy Based Pricing</Label>
                    </div>
                    {occupancyPricing.map((pricing) => (
                      <div key={pricing.id} className="flex items-center space-x-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`occupant-count-${pricing.id}`} className="sr-only">Occupant Count</Label>
                            <Input
                              id={`occupant-count-${pricing.id}`}
                              type="number"
                              min="1"
                              placeholder="Occupant Count"
                              value={pricing.occupantCount}
                              onChange={(e) => updateOccupancyPricing(pricing.id, 'occupantCount', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="flex">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount"
                              value={pricing.amount}
                              onChange={(e) => updateOccupancyPricing(pricing.id, 'amount', parseFloat(e.target.value))}
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
                          onClick={() => removeOccupancyPricing(pricing.id)}
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
                  onClick={addOccupancyPricing}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Occupancy Pricing
                </Button>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Per Occupant Charges</p>
                      <p className="mt-1">The Adult Amount is mandatory and will be charged for each adult. Child and Infant amounts are optional.</p>
                      <p className="mt-1">You can define specific charges for different age ranges of children and for specific numbers of occupants.</p>
                    </div>
                  </div>
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
                     (chargeType === "per-occupant" && !adultAmount)}
          >
            Add another value
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueForm;
