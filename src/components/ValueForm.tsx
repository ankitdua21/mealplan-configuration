import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParameterSet, RatePlan, RoomType, SupplementValue, ChargeType, AgeRange, OccupancyPricing, PositionPricing } from "@/models/SupplementTypes";
import ParameterBuilder from "./ParameterBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [leadTime, setLeadTime] = useState<number | undefined>(undefined);
  const [minStay, setMinStay] = useState<number | undefined>(undefined);
  
  const [isTargetingConditionsOpen, setIsTargetingConditionsOpen] = useState(false);
  
  const [baseAmount, setBaseAmount] = useState("");
  const [extraAdultAmount, setExtraAdultAmount] = useState("");
  const [extraChildAmount, setExtraChildAmount] = useState("");
  const [extraInfantAmount, setExtraInfantAmount] = useState("");
  
  const [adultAmount, setAdultAmount] = useState("");
  const [childAmount, setChildAmount] = useState("");
  const [infantAmount, setInfantAmount] = useState("");
  const [childAgeRanges, setChildAgeRanges] = useState<AgeRange[]>([]);
  
  const [adultPricing, setAdultPricing] = useState<PositionPricing[]>([
    { id: crypto.randomUUID(), position: 1, amount: 0 }
  ]);
  
  const [childPricing, setChildPricing] = useState<PositionPricing[]>([
    { id: crypto.randomUUID(), position: 1, amount: 0 }
  ]);
  
  const [infantPricing, setInfantPricing] = useState<PositionPricing[]>([
    { id: crypto.randomUUID(), position: 1, amount: 0 }
  ]);
  
  const [occupancyPricing, setOccupancyPricing] = useState<OccupancyPricing[]>([
    { id: crypto.randomUUID(), occupantCount: 1, amount: 0 },
    { id: crypto.randomUUID(), occupantCount: 2, amount: 0 }
  ]);

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
    if (!parameters) return;

    let updatedParameters = { ...parameters, chargeType };
    
    if (description.trim()) {
      updatedParameters.description = description;
    }
    
    if (leadTime !== undefined) {
      updatedParameters.leadTime = leadTime;
    }
    
    if (minStay !== undefined) {
      updatedParameters.minStay = minStay;
    }
    
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
        occupancyPricing: [],
        adultPricing: [...adultPricing].filter(p => p.amount > 0),
        childPricing: [...childPricing].filter(p => p.amount > 0),
        infantPricing: [...infantPricing].filter(p => p.amount > 0)
      };
    } else {
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
    setLeadTime(undefined);
    setMinStay(undefined);
    setBaseAmount("");
    setExtraAdultAmount("");
    setExtraChildAmount("");
    setExtraInfantAmount("");
    setAdultAmount("");
    setChildAmount("");
    setInfantAmount("");
    setChildAgeRanges([]);
    setAdultPricing([{ id: crypto.randomUUID(), position: 1, amount: 0 }]);
    setChildPricing([{ id: crypto.randomUUID(), position: 1, amount: 0 }]);
    setInfantPricing([{ id: crypto.randomUUID(), position: 1, amount: 0 }]);
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
    setIsTargetingConditionsOpen(false);
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
  
  const addAdultPricing = () => {
    const nextPosition = Math.max(...adultPricing.map(p => p.position)) + 1;
    setAdultPricing([
      ...adultPricing,
      { id: crypto.randomUUID(), position: nextPosition, amount: 0 }
    ]);
  };

  const updateAdultPricing = (id: string, field: 'amount', value: number) => {
    setAdultPricing(adultPricing.map(pricing => 
      pricing.id === id ? { ...pricing, [field]: value } : pricing
    ));
  };

  const removeAdultPricing = (id: string) => {
    setAdultPricing(adultPricing.filter(pricing => pricing.id !== id));
  };
  
  const addChildPricing = () => {
    const nextPosition = Math.max(...childPricing.map(p => p.position)) + 1;
    setChildPricing([
      ...childPricing,
      { id: crypto.randomUUID(), position: nextPosition, amount: 0 }
    ]);
  };

  const updateChildPricing = (id: string, field: 'amount', value: number) => {
    setChildPricing(childPricing.map(pricing => 
      pricing.id === id ? { ...pricing, [field]: value } : pricing
    ));
  };

  const removeChildPricing = (id: string) => {
    setChildPricing(childPricing.filter(pricing => pricing.id !== id));
  };
  
  const addInfantPricing = () => {
    const nextPosition = Math.max(...infantPricing.map(p => p.position)) + 1;
    setInfantPricing([
      ...infantPricing,
      { id: crypto.randomUUID(), position: nextPosition, amount: 0 }
    ]);
  };

  const updateInfantPricing = (id: string, field: 'amount', value: number) => {
    setInfantPricing(infantPricing.map(pricing => 
      pricing.id === id ? { ...pricing, [field]: value } : pricing
    ));
  };

  const removeInfantPricing = (id: string) => {
    setInfantPricing(infantPricing.filter(pricing => pricing.id !== id));
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

  const addNextPositions = () => {
    const nextAdultPosition = Math.max(...adultPricing.map(p => p.position)) + 1;
    const nextChildPosition = Math.max(...childPricing.map(p => p.position)) + 1;
    const nextInfantPosition = Math.max(...infantPricing.map(p => p.position)) + 1;
    
    const nextId = crypto.randomUUID();
    
    setAdultPricing([
      ...adultPricing,
      { id: nextId, position: nextAdultPosition, amount: 0 }
    ]);
    
    setChildPricing([
      ...childPricing,
      { id: nextId, position: nextChildPosition, amount: 0 }
    ]);
    
    setInfantPricing([
      ...infantPricing,
      { id: nextId, position: nextInfantPosition, amount: 0 }
    ]);
  };
  
  const removePositionGroup = (id: string) => {
    setAdultPricing(adultPricing.filter(pricing => pricing.id !== id));
    setChildPricing(childPricing.filter(pricing => pricing.id !== id));
    setInfantPricing(infantPricing.filter(pricing => pricing.id !== id));
  };

  return (
    <Card id="valueForm">
      <CardHeader>
        <CardTitle className="text-lg">Add Mealplan Value</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description" className="text-sm flex items-center">
                Description <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter a detailed description of this mealplan value"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20 mt-1"
                required
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
                      1st Adult <span className="text-red-500 ml-1">*</span>
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
                    <Label htmlFor="childAmount">1st Child</Label>
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
                    <Label htmlFor="infantAmount">1st Infant</Label>
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
                
                {childAmount && parseFloat(childAmount) > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Child Age Ranges <span className="text-red-500 ml-1">*</span></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="min-age" className="text-sm">Min Age</Label>
                          <Input
                            id="min-age"
                            type="number"
                            min="0"
                            max="17"
                            placeholder="Min Age"
                            value={childAgeRanges[0]?.minAge || ""}
                            onChange={(e) => {
                              if (childAgeRanges.length === 0) {
                                setChildAgeRanges([
                                  { id: crypto.randomUUID(), minAge: parseInt(e.target.value) || 0, maxAge: 0, amount: 0 }
                                ]);
                              } else {
                                updateChildAgeRange(childAgeRanges[0].id, 'minAge', parseInt(e.target.value) || 0)
                              }
                            }}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-age" className="text-sm">Max Age</Label>
                          <Input
                            id="max-age"
                            type="number"
                            min="0"
                            max="17"
                            placeholder="Max Age"
                            value={childAgeRanges[0]?.maxAge || ""}
                            onChange={(e) => {
                              if (childAgeRanges.length === 0) {
                                setChildAgeRanges([
                                  { id: crypto.randomUUID(), minAge: 0, maxAge: parseInt(e.target.value) || 0, amount: parseFloat(childAmount) || 0 }
                                ]);
                              } else {
                                updateChildAgeRange(childAgeRanges[0].id, 'maxAge', parseInt(e.target.value) || 0)
                              }
                            }}
                            className="h-10"
                          />
                        </div>
                        <div className="flex w-full">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            value={childAgeRanges[0]?.amount || childAmount}
                            onChange={(e) => {
                              if (childAgeRanges.length === 0) {
                                setChildAgeRanges([
                                  { id: crypto.randomUUID(), minAge: 0, maxAge: 0, amount: parseFloat(e.target.value) || 0 }
                                ]);
                              } else {
                                updateChildAgeRange(childAgeRanges[0].id, 'amount', parseFloat(e.target.value) || 0)
                              }
                            }}
                            className="rounded-r-none flex-grow h-10"
                          />
                          <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                            {currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    {childAgeRanges.slice(1).map((range) => (
                      <div key={range.id} className="flex items-center space-x-2">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <Input
                              type="number"
                              min="0"
                              max="17"
                              placeholder="Min Age"
                              value={range.minAge || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'minAge', parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              min="0"
                              max="17"
                              placeholder="Max Age"
                              value={range.maxAge || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'maxAge', parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                          <div className="flex w-full">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount"
                              value={range.amount || ""}
                              onChange={(e) => updateChildAgeRange(range.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="rounded-r-none flex-grow h-10"
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
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNextPositions}
                      className="mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Next Adult
                    </Button>
                  </div>

                  {adultPricing.length > 1 && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {adultPricing.filter(p => p.position > 1).map((pricing) => {
                          const childPricingItem = childPricing.find(p => p.id === pricing.id);
                          const infantPricingItem = infantPricing.find(p => p.id === pricing.id);
                          return (
                            <div key={pricing.id} className="flex flex-col space-y-4 p-4 border rounded-md relative">
                              <div>
                                <Label htmlFor={`adult-${pricing.id}`} className="text-sm">
                                  {pricing.position === 2 ? "2nd Adult" : pricing.position === 3 ? "3rd Adult" : `${pricing.position}th Adult`}
                                  <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="flex mt-1">
                                  <Input
                                    id={`adult-${pricing.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pricing.amount || ""}
                                    onChange={(e) => updateAdultPricing(pricing.id, 'amount', parseFloat(e.target.value) || 0)}
                                    className="rounded-r-none"
                                    required
                                  />
                                  <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                                    {currency}
                                  </div>
                                </div>
                              </div>
                              {childPricingItem && (
                                <div>
                                  <Label htmlFor={`child-${pricing.id}`} className="text-sm">
                                    {childPricingItem.position === 2 ? "2nd Child" : childPricingItem.position === 3 ? "3rd Child" : `${childPricingItem.position}th Child`}
                                  </Label>
                                  <div className="flex mt-1">
                                    <Input
                                      id={`child-${pricing.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={childPricingItem.amount || ""}
                                      onChange={(e) => updateChildPricing(childPricingItem.id, 'amount', parseFloat(e.target.value) || 0)}
                                      className="rounded-r-none"
                                    />
                                    <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                                      {currency}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {infantPricingItem && (
                                <div>
                                  <Label htmlFor={`infant-${pricing.id}`} className="text-sm">
                                    {infantPricingItem.position === 2 ? "2nd Infant" : infantPricingItem.position === 3 ? "3rd Infant" : `${infantPricingItem.position}th Infant`}
                                  </Label>
                                  <div className="flex mt-1">
                                    <Input
                                      id={`infant-${pricing.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={infantPricingItem.amount || ""}
                                      onChange={(e) => updateInfantPricing(infantPricingItem.id, 'amount', parseFloat(e.target.value) || 0)}
                                      className="rounded-r-none"
                                    />
                                    <div className="bg-muted px-3 flex items-center rounded-r-md border border-l-0 border-input">
                                      {currency}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => removePositionGroup(pricing.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="per-occupant" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {occupancyPricing.map((pricing) => (
                      <div key={pricing.id} className="flex items-center space-x-2">
                        <div className="flex-1">
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
                  </div>
                  
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
          <div className="border rounded-md">
            <div className="px-4 py-3">
              {parameters && (
                <ParameterBuilder
                  roomTypes={roomTypes}
                  ratePlans={ratePlans}
                  onChange={handleParametersChange}
                  value={{...parameters, showRoomTypes: true, showRatePlans: true, showDateRanges: false, showDaysOfWeek: false}}
                />
              )}
            </div>
          </div>
          
          <Collapsible 
            open={isTargetingConditionsOpen} 
            onOpenChange={setIsTargetingConditionsOpen}
            className="border rounded-md"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 font-medium bg-gray-50">
              <span>Targeting Conditions</span>
              {isTargetingConditionsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3">
              <div className="space-y-4">
                <div className="space-y-2">
                  {parameters && (
                    <ParameterBuilder
                      roomTypes={roomTypes}
                      ratePlans={ratePlans}
                      onChange={handleParametersChange}
                      value={{...parameters, showDateRanges: true, showDaysOfWeek: false, showRoomTypes: false, showRatePlans: false}}
                    />
                  )}
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t">
                  {parameters && (
                    <ParameterBuilder
                      roomTypes={roomTypes}
                      ratePlans={ratePlans}
                      onChange={handleParametersChange}
                      value={{...parameters, showDateRanges: false, showDaysOfWeek: true, showRoomTypes: false, showRatePlans: false}}
                    />
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base font-medium
