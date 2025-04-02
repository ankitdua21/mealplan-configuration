
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Conflict, SupplementValue, DateRange, RoomType, RatePlan } from "@/models/SupplementTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConflictResolverProps {
  conflicts: Conflict[];
  values: SupplementValue[];
  onResolve: (resolvedValues: SupplementValue[]) => void;
  onCancel: () => void;
}

type OverlapType = 'dates' | 'roomTypes' | 'ratePlans' | 'all';

interface Overlap {
  type: OverlapType;
  itemsToRemove: any[];
  valueIndex: number;
}

const ConflictResolver = ({ conflicts, values, onResolve, onCancel }: ConflictResolverProps) => {
  const [resolvedValues, setResolvedValues] = useState<SupplementValue[]>([...values]);
  const [selectedValueIndex, setSelectedValueIndex] = useState<number | null>(null);
  const [removedOtherValue, setRemovedOtherValue] = useState<boolean>(false);

  // Function to check for date range overlaps
  const findDateRangeOverlaps = (value1: SupplementValue, value2: SupplementValue): DateRange[] => {
    const overlaps: DateRange[] = [];
    
    if (value1.parameters.dateRanges.length === 0 || value2.parameters.dateRanges.length === 0) {
      return []; // If either has no date ranges (all dates), we consider no specific overlap
    }
    
    for (const range1 of value1.parameters.dateRanges) {
      for (const range2 of value2.parameters.dateRanges) {
        if (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate) {
          // Create a new date range representing the overlap
          const overlapStart = new Date(Math.max(range1.startDate.getTime(), range2.startDate.getTime()));
          const overlapEnd = new Date(Math.min(range1.endDate.getTime(), range2.endDate.getTime()));
          
          overlaps.push({
            id: crypto.randomUUID(),
            startDate: overlapStart,
            endDate: overlapEnd
          });
        }
      }
    }
    
    return overlaps;
  };

  // Function to find overlapping room types
  const findRoomTypeOverlaps = (value1: SupplementValue, value2: SupplementValue): RoomType[] => {
    if (value1.parameters.roomTypes.length === 0 || value2.parameters.roomTypes.length === 0) {
      return []; // If either has all room types selected, no specific overlap
    }
    
    return value1.parameters.roomTypes.filter(rt1 => 
      value2.parameters.roomTypes.some(rt2 => rt1.id === rt2.id)
    );
  };

  // Function to find overlapping rate plans
  const findRatePlanOverlaps = (value1: SupplementValue, value2: SupplementValue): RatePlan[] => {
    if (value1.parameters.ratePlans.length === 0 || value2.parameters.ratePlans.length === 0) {
      return []; // If either has all rate plans selected, no specific overlap
    }
    
    return value1.parameters.ratePlans.filter(rp1 => 
      value2.parameters.ratePlans.some(rp2 => rp1.id === rp2.id)
    );
  };

  // Function to determine the smallest overlap and suggested resolution
  const determineSmallestOverlap = (conflict: Conflict): Overlap | null => {
    const valueIds = conflict.valueIds;
    const value1Index = resolvedValues.findIndex(v => v.id === valueIds[0]);
    const value2Index = resolvedValues.findIndex(v => v.id === valueIds[1]);
    
    if (value1Index === -1 || value2Index === -1) return null;
    
    const value1 = resolvedValues[value1Index];
    const value2 = resolvedValues[value2Index];
    
    // Check date range overlaps
    const dateOverlaps = findDateRangeOverlaps(value1, value2);
    if (dateOverlaps.length > 0) {
      // Determine which value should have the overlap removed
      // For simplicity, suggest removing from the value with more date ranges
      const valueIndex = value1.parameters.dateRanges.length >= value2.parameters.dateRanges.length 
        ? value1Index : value2Index;
      
      return {
        type: 'dates',
        itemsToRemove: dateOverlaps,
        valueIndex
      };
    }
    
    // Check rate plan overlaps
    const ratePlanOverlaps = findRatePlanOverlaps(value1, value2);
    if (ratePlanOverlaps.length > 0) {
      // Suggest removing from the value with more rate plans
      const valueIndex = value1.parameters.ratePlans.length >= value2.parameters.ratePlans.length
        ? value1Index : value2Index;
      
      return {
        type: 'ratePlans',
        itemsToRemove: ratePlanOverlaps,
        valueIndex
      };
    }
    
    // Check room type overlaps
    const roomTypeOverlaps = findRoomTypeOverlaps(value1, value2);
    if (roomTypeOverlaps.length > 0) {
      // Suggest removing from the value with more room types
      const valueIndex = value1.parameters.roomTypes.length >= value2.parameters.roomTypes.length
        ? value1Index : value2Index;
      
      return {
        type: 'roomTypes',
        itemsToRemove: roomTypeOverlaps,
        valueIndex
      };
    }
    
    // If we get here, there's a complete overlap (all dates, all room types, all rate plans)
    return {
      type: 'all',
      itemsToRemove: [],
      valueIndex: value1Index // Default to first value for complete overlap
    };
  };

  const handleRemoveOverlap = (valueIndex: number, overlapType: OverlapType, itemsToRemove: any[]) => {
    const updatedValues = [...resolvedValues];
    const value = {...updatedValues[valueIndex]};
    
    if (overlapType === 'dates') {
      // Remove overlapping date ranges
      const dateRanges = [...value.parameters.dateRanges];
      
      // For each overlap, modify or remove affected date ranges
      for (const overlap of itemsToRemove as DateRange[]) {
        for (let i = 0; i < dateRanges.length; i++) {
          const range = dateRanges[i];
          
          // If range is completely within overlap, remove it
          if (range.startDate >= overlap.startDate && range.endDate <= overlap.endDate) {
            dateRanges.splice(i, 1);
            i--;
          } 
          // If overlap is at the beginning of the range
          else if (range.startDate >= overlap.startDate && range.startDate <= overlap.endDate && range.endDate > overlap.endDate) {
            dateRanges[i] = {
              ...range,
              startDate: new Date(overlap.endDate.getTime() + 86400000) // One day after overlap ends
            };
          }
          // If overlap is at the end of the range
          else if (range.startDate < overlap.startDate && range.endDate >= overlap.startDate && range.endDate <= overlap.endDate) {
            dateRanges[i] = {
              ...range,
              endDate: new Date(overlap.startDate.getTime() - 86400000) // One day before overlap starts
            };
          }
          // If overlap is in the middle of the range, split into two ranges
          else if (range.startDate < overlap.startDate && range.endDate > overlap.endDate) {
            const secondPart = {
              id: crypto.randomUUID(),
              startDate: new Date(overlap.endDate.getTime() + 86400000),
              endDate: new Date(range.endDate)
            };
            
            dateRanges[i] = {
              ...range,
              endDate: new Date(overlap.startDate.getTime() - 86400000)
            };
            
            dateRanges.push(secondPart);
          }
        }
      }
      
      value.parameters = {
        ...value.parameters,
        dateRanges
      };
    } else if (overlapType === 'roomTypes') {
      // Remove overlapping room types
      const roomTypeIds = new Set(itemsToRemove.map((rt: RoomType) => rt.id));
      value.parameters = {
        ...value.parameters,
        roomTypes: value.parameters.roomTypes.filter(rt => !roomTypeIds.has(rt.id))
      };
    } else if (overlapType === 'ratePlans') {
      // Remove overlapping rate plans
      const ratePlanIds = new Set(itemsToRemove.map((rp: RatePlan) => rp.id));
      value.parameters = {
        ...value.parameters,
        ratePlans: value.parameters.ratePlans.filter(rp => !ratePlanIds.has(rp.id))
      };
    }
    
    updatedValues[valueIndex] = value;
    setResolvedValues(updatedValues);
  };

  const handleSelectValue = (valueIndex: number) => {
    const updatedValues = resolvedValues.filter((_, index) => index === valueIndex);
    setSelectedValueIndex(valueIndex);
    setRemovedOtherValue(true);
    setResolvedValues(updatedValues);
  };

  const handleComplete = () => {
    onResolve(resolvedValues);
  };

  const getChargeTypeDisplay = (chargeType: string) => {
    switch(chargeType) {
      case "per-room":
        return "Per Room";
      case "per-adult-child":
        return "Per Adult/Child";
      case "per-occupant":
        return "Per Occupant";
      default:
        return chargeType;
    }
  };

  if (removedOtherValue) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Conflict Resolution</CardTitle>
          <CardDescription>
            You have chosen to keep only one value to resolve the conflict.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200 mb-4">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Conflict has been resolved by keeping only one value.
            </AlertDescription>
          </Alert>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Date Ranges</TableHead>
                <TableHead>Room Types</TableHead>
                <TableHead>Rate Plans</TableHead>
                <TableHead>Charge Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolvedValues.map((value) => (
                <TableRow key={value.id}>
                  <TableCell>
                    {value.amount} {value.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {value.parameters.dateRanges.length > 0 ? (
                        value.parameters.dateRanges.map((range, i) => (
                          <Badge key={i} variant="outline" className="inline-block text-xs">
                            {format(range.startDate, "MMM d, yyyy")} - {format(range.endDate, "MMM d, yyyy")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">All dates</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {value.parameters.roomTypes.length === 0 ? (
                      <span className="text-muted-foreground">All room types</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {value.parameters.roomTypes.map((type) => (
                          <Badge key={type.id} variant="outline" className="text-xs">
                            {type.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {value.parameters.ratePlans.length === 0 ? (
                      <span className="text-muted-foreground">All rate plans</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {value.parameters.ratePlans.map((plan) => (
                          <Badge key={plan.id} variant="outline" className="text-xs">
                            {plan.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getChargeTypeDisplay(value.parameters.chargeType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>
            Save Mealplan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conflicts Detected</CardTitle>
        <CardDescription>
          We found conflicts between your mealplan values. Please resolve them by either removing overlapping criteria or selecting a single value to keep.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {conflicts.map((conflict, index) => {
            const conflictingValues = [
              resolvedValues.find(v => v.id === conflict.valueIds[0]),
              resolvedValues.find(v => v.id === conflict.valueIds[1])
            ].filter(Boolean) as SupplementValue[];
            
            if (conflictingValues.length < 2) return null;
            
            const overlap = determineSmallestOverlap(conflict);
            
            return (
              <div key={index} className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Conflict {index + 1}</AlertTitle>
                  <AlertDescription>
                    {overlap?.type === 'all' ? (
                      "These values have completely overlapping criteria (all dates, room types, and rate plans). You need to choose one to keep."
                    ) : (
                      `These values have overlapping ${overlap?.type || 'parameters'}.`
                    )}
                  </AlertDescription>
                </Alert>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date Ranges</TableHead>
                      <TableHead>Room Types</TableHead>
                      <TableHead>Rate Plans</TableHead>
                      <TableHead>Charge Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflictingValues.map((value, valueIdx) => (
                      <TableRow key={value.id}>
                        <TableCell>
                          {value.amount} {value.currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {value.parameters.dateRanges.length > 0 ? (
                              value.parameters.dateRanges.map((range, i) => (
                                <Badge key={i} variant="outline" className="inline-block text-xs">
                                  {format(range.startDate, "MMM d, yyyy")} - {format(range.endDate, "MMM d, yyyy")}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">All dates</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {value.parameters.roomTypes.length === 0 ? (
                            <span className="text-muted-foreground">All room types</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {value.parameters.roomTypes.map((type) => (
                                <Badge key={type.id} variant="outline" className="text-xs">
                                  {type.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {value.parameters.ratePlans.length === 0 ? (
                            <span className="text-muted-foreground">All rate plans</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {value.parameters.ratePlans.map((plan) => (
                                <Badge key={plan.id} variant="outline" className="text-xs">
                                  {plan.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getChargeTypeDisplay(value.parameters.chargeType)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {overlap?.type === 'all' ? (
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <h3 className="font-medium">Choose one value to keep:</h3>
                    <div className="flex space-x-2">
                      {conflictingValues.map((value, valueIdx) => {
                        const valueIndex = resolvedValues.findIndex(v => v.id === value.id);
                        return (
                          <Button 
                            key={value.id} 
                            variant="outline"
                            onClick={() => handleSelectValue(valueIndex)}
                          >
                            Keep Value {valueIdx + 1}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : overlap && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <Tabs defaultValue="option1" className="w-full">
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="option1">Remove from Value 1</TabsTrigger>
                        <TabsTrigger value="option2">Remove from Value 2</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="option1" className="space-y-4 pt-4">
                        <div>
                          {overlap.type === 'dates' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping date ranges:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as DateRange[]).map((dateRange, i) => (
                                  <Badge key={i} variant="outline" className="mr-2 mb-2">
                                    {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {overlap.type === 'roomTypes' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping room types:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as RoomType[]).map((roomType) => (
                                  <Badge key={roomType.id} variant="outline" className="mr-2 mb-2">
                                    {roomType.name}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {overlap.type === 'ratePlans' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping rate plans:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as RatePlan[]).map((ratePlan) => (
                                  <Badge key={ratePlan.id} variant="outline" className="mr-2 mb-2">
                                    {ratePlan.name}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleRemoveOverlap(
                            resolvedValues.findIndex(v => v.id === conflictingValues[0].id),
                            overlap.type,
                            overlap.itemsToRemove
                          )}
                        >
                          Remove from Value 1
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="option2" className="space-y-4 pt-4">
                        <div>
                          {overlap.type === 'dates' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping date ranges:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as DateRange[]).map((dateRange, i) => (
                                  <Badge key={i} variant="outline" className="mr-2 mb-2">
                                    {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {overlap.type === 'roomTypes' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping room types:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as RoomType[]).map((roomType) => (
                                  <Badge key={roomType.id} variant="outline" className="mr-2 mb-2">
                                    {roomType.name}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {overlap.type === 'ratePlans' && (
                            <>
                              <h4 className="font-medium mb-2">Remove these overlapping rate plans:</h4>
                              <div className="space-y-2">
                                {(overlap.itemsToRemove as RatePlan[]).map((ratePlan) => (
                                  <Badge key={ratePlan.id} variant="outline" className="mr-2 mb-2">
                                    {ratePlan.name}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleRemoveOverlap(
                            resolvedValues.findIndex(v => v.id === conflictingValues[1].id),
                            overlap.type,
                            overlap.itemsToRemove
                          )}
                        >
                          Remove from Value 2
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={conflicts.length > 0 && !removedOtherValue}
        >
          Save Mealplan
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConflictResolver;
