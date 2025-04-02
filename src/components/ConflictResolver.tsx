import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Conflict, SupplementValue, DateRange, RoomType, RatePlan } from "@/models/SupplementTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [currentConflictIndex, setCurrentConflictIndex] = useState<number>(0);
  const [activeOverlapType, setActiveOverlapType] = useState<OverlapType | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [selectedValueToKeep, setSelectedValueToKeep] = useState<number | null>(null);
  const [remainingConflicts, setRemainingConflicts] = useState<Conflict[]>([...conflicts]);

  // Reset conflict resolution when component mounts or when conflicts change
  useEffect(() => {
    setResolvedValues([...values]);
    setRemainingConflicts([...conflicts]);
    setCurrentConflictIndex(0);
    setActiveOverlapType(null);
    setShowSuccessDialog(false);
    setSelectedValueToKeep(null);
    
    // Determine initial overlap type to check
    if (conflicts.length > 0) {
      const initialType = determineOverlapTypeToResolve();
      setActiveOverlapType(initialType);
    }
  }, [conflicts, values]);

  // Function to determine which overlap type to resolve next
  const determineOverlapTypeToResolve = (): OverlapType | null => {
    if (remainingConflicts.length === 0) return null;
    
    const currentConflict = remainingConflicts[currentConflictIndex];
    if (!currentConflict) return null;
    
    const conflictingValues = currentConflict.valueIds.map(id => 
      resolvedValues.find(v => v.id === id)
    ).filter(Boolean) as SupplementValue[];
    
    if (conflictingValues.length < 2) return null;
    
    // First check for date range overlaps
    if (hasSpecificDateRanges(conflictingValues)) {
      return 'dates';
    }
    
    // Next check for specific rate plan selections
    if (hasSpecificRatePlans(conflictingValues)) {
      return 'ratePlans';
    }
    
    // Next check for specific room type selections
    if (hasSpecificRoomTypes(conflictingValues)) {
      return 'roomTypes';
    }
    
    // If all parameters are using 'all' selections, it's a complete overlap
    return 'all';
  };

  // Helper functions to check if there are specific selections
  const hasSpecificDateRanges = (values: SupplementValue[]): boolean => {
    return values.some(v => v.parameters.dateRanges.length > 0);
  };

  const hasSpecificRatePlans = (values: SupplementValue[]): boolean => {
    return values.some(v => v.parameters.ratePlans.length > 0);
  };

  const hasSpecificRoomTypes = (values: SupplementValue[]): boolean => {
    return values.some(v => v.parameters.roomTypes.length > 0);
  };

  // Function to check for date range overlaps
  const findDateRangeOverlaps = (value1: SupplementValue, value2: SupplementValue): DateRange[] => {
    const overlaps: DateRange[] = [];
    
    // If either has no date ranges (all dates), we consider no specific overlap to remove
    if (value1.parameters.dateRanges.length === 0 || value2.parameters.dateRanges.length === 0) {
      return []; 
    }
    
    for (const range1 of value1.parameters.dateRanges) {
      for (const range2 of value2.parameters.dateRanges) {
        if (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate) {
          // Create a new date range representing the overlap
          const overlapStart = new Date(Math.max(range1.startDate.getTime(), range2.startDate.getTime()));
          const overlapEnd = new Date(Math.min(range1.endDate.getTime(), range2.endDate.getTime()));
          
          overlaps.push({
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
    // If either has no room types selected (all room types), we consider no specific overlap to remove
    if (value1.parameters.roomTypes.length === 0 || value2.parameters.roomTypes.length === 0) {
      return []; 
    }
    
    return value1.parameters.roomTypes.filter(rt1 => 
      value2.parameters.roomTypes.some(rt2 => rt1.id === rt2.id)
    );
  };

  // Function to find overlapping rate plans
  const findRatePlanOverlaps = (value1: SupplementValue, value2: SupplementValue): RatePlan[] => {
    // If either has no rate plans selected (all rate plans), we consider no specific overlap to remove
    if (value1.parameters.ratePlans.length === 0 || value2.parameters.ratePlans.length === 0) {
      return []; 
    }
    
    return value1.parameters.ratePlans.filter(rp1 => 
      value2.parameters.ratePlans.some(rp2 => rp1.id === rp2.id)
    );
  };

  // Function to get current conflict and values
  const getCurrentConflictData = () => {
    if (remainingConflicts.length === 0) return { conflict: null, conflictingValues: [] };
    
    const conflict = remainingConflicts[currentConflictIndex];
    if (!conflict) return { conflict: null, conflictingValues: [] };
    
    const conflictingValues = conflict.valueIds.map(id => 
      resolvedValues.find(v => v.id === id)
    ).filter(Boolean) as SupplementValue[];
    
    return { conflict, conflictingValues };
  };

  // Function to get overlaps based on current overlap type
  const getCurrentOverlaps = () => {
    const { conflictingValues } = getCurrentConflictData();
    if (conflictingValues.length < 2 || !activeOverlapType) return [];
    
    const [value1, value2] = conflictingValues;
    
    switch (activeOverlapType) {
      case 'dates':
        return findDateRangeOverlaps(value1, value2);
      case 'ratePlans':
        return findRatePlanOverlaps(value1, value2);
      case 'roomTypes':
        return findRoomTypeOverlaps(value1, value2);
      default:
        return [];
    }
  };

  // Handle removing overlaps from a specific value
  const handleRemoveOverlap = (valueIndex: number) => {
    const { conflict, conflictingValues } = getCurrentConflictData();
    if (!conflict || conflictingValues.length < 2 || !activeOverlapType) return;
    
    const updatedValues = [...resolvedValues];
    const targetValueId = conflict.valueIds[valueIndex];
    const targetValueIndex = resolvedValues.findIndex(v => v.id === targetValueId);
    
    if (targetValueIndex === -1) return;
    
    const value = {...updatedValues[targetValueIndex]};
    const overlaps = getCurrentOverlaps();
    
    if (activeOverlapType === 'dates') {
      // Remove overlapping date ranges
      const dateRanges = [...value.parameters.dateRanges];
      
      // For each overlap, modify or remove affected date ranges
      for (const overlap of overlaps as DateRange[]) {
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
    } else if (activeOverlapType === 'roomTypes') {
      // Remove overlapping room types
      const roomTypeIds = new Set((overlaps as RoomType[]).map(rt => rt.id));
      value.parameters = {
        ...value.parameters,
        roomTypes: value.parameters.roomTypes.filter(rt => !roomTypeIds.has(rt.id))
      };
    } else if (activeOverlapType === 'ratePlans') {
      // Remove overlapping rate plans
      const ratePlanIds = new Set((overlaps as RatePlan[]).map(rp => rp.id));
      value.parameters = {
        ...value.parameters,
        ratePlans: value.parameters.ratePlans.filter(rp => !ratePlanIds.has(rp.id))
      };
    }
    
    updatedValues[targetValueIndex] = value;
    setResolvedValues(updatedValues);
    
    // Check for remaining conflicts after applying changes
    checkForRemainingConflicts(updatedValues);
  };

  // Handle selecting a single value to keep (for complete overlaps)
  const handleSelectValue = () => {
    if (selectedValueToKeep === null) return;
    
    const { conflict } = getCurrentConflictData();
    if (!conflict) return;
    
    // Keep only the selected value
    const valueIdToKeep = conflict.valueIds[selectedValueToKeep];
    const updatedValues = resolvedValues.filter(v => 
      !conflict.valueIds.includes(v.id) || v.id === valueIdToKeep
    );
    
    setResolvedValues(updatedValues);
    
    // Check for remaining conflicts after applying changes
    checkForRemainingConflicts(updatedValues);
  };

  // Check for conflicts after resolving a specific type
  const checkForRemainingConflicts = (updatedValues: SupplementValue[]) => {
    // Detect conflicts among updated values
    const detectedConflicts = detectConflicts(updatedValues);
    
    if (detectedConflicts.length === 0) {
      // If no conflicts remain, show success and allow saving
      setShowSuccessDialog(true);
      setRemainingConflicts([]);
    } else {
      // Update remaining conflicts and determine next type to resolve
      setRemainingConflicts(detectedConflicts);
      setCurrentConflictIndex(0);
      const nextType = determineOverlapTypeToResolve();
      setActiveOverlapType(nextType);
    }
  };

  // Detect conflicts between values
  const detectConflicts = (values: SupplementValue[]): Conflict[] => {
    const conflicts: Conflict[] = [];
    
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const value1 = values[i];
        const value2 = values[j];
        const conflictingParameters: Array<keyof Omit<typeof value1.parameters, 'id' | 'condition' | 'chargeType'>> = [];
        
        const dateRanges1 = value1.parameters.dateRanges;
        const dateRanges2 = value2.parameters.dateRanges;
        
        let dateRangeConflict = false;
        if (dateRanges1.length === 0 || dateRanges2.length === 0) {
          dateRangeConflict = true;
        } else {
          for (const range1 of dateRanges1) {
            for (const range2 of dateRanges2) {
              if (
                (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate) ||
                (range2.startDate <= range1.endDate && range2.endDate >= range1.startDate)
              ) {
                dateRangeConflict = true;
                break;
              }
            }
            if (dateRangeConflict) break;
          }
        }
        
        if (dateRangeConflict) {
          conflictingParameters.push("dateRanges");
        }
        
        const roomTypes1 = value1.parameters.roomTypes;
        const roomTypes2 = value2.parameters.roomTypes;
        
        let roomTypeConflict = false;
        if (roomTypes1.length === 0 || roomTypes2.length === 0) {
          roomTypeConflict = true;
        } else {
          for (const type1 of roomTypes1) {
            for (const type2 of roomTypes2) {
              if (type1.id === type2.id) {
                roomTypeConflict = true;
                break;
              }
            }
            if (roomTypeConflict) break;
          }
        }
        
        if (roomTypeConflict) {
          conflictingParameters.push("roomTypes");
        }
        
        const ratePlans1 = value1.parameters.ratePlans;
        const ratePlans2 = value2.parameters.ratePlans;
        
        let ratePlanConflict = false;
        if (ratePlans1.length === 0 || ratePlans2.length === 0) {
          ratePlanConflict = true;
        } else {
          for (const plan1 of ratePlans1) {
            for (const plan2 of ratePlans2) {
              if (plan1.id === plan2.id) {
                ratePlanConflict = true;
                break;
              }
            }
            if (ratePlanConflict) break;
          }
        }
        
        if (ratePlanConflict) {
          conflictingParameters.push("ratePlans");
        }
        
        if (conflictingParameters.length === 3) {
          conflicts.push({
            valueIds: [value1.id, value2.id],
            conflictingParameters,
          });
        }
      }
    }
    
    return conflicts;
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

  const { conflict, conflictingValues } = getCurrentConflictData();

  // If there's no conflict or no values to resolve, redirect to completion
  if (!conflict || conflictingValues.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Conflict Resolution</CardTitle>
          <CardDescription>
            All conflicts have been resolved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200 mb-4">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              All conflicts have been resolved successfully!
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button onClick={handleComplete}>
            Save Mealplan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If there's a success alert but still more conflicts
  if (showSuccessDialog) {
    return (
      <AlertDialog open={showSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conflict Resolved</AlertDialogTitle>
            <AlertDialogDescription>
              The current conflict has been resolved. Would you like to continue resolving remaining conflicts or save the mealplan now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSuccessDialog(false)}>
              Continue Resolving
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Save Mealplan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Return UI for resolving conflicts based on the active overlap type
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conflicts Detected</CardTitle>
        <CardDescription>
          We found conflicts between your mealplan values. Please resolve them by following the suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conflict {currentConflictIndex + 1} of {remainingConflicts.length}</AlertTitle>
            <AlertDescription>
              {activeOverlapType === 'all' ? (
                "These values have completely overlapping criteria (all dates, room types, and rate plans). You need to choose one to keep."
              ) : (
                `These values have overlapping ${activeOverlapType}.`
              )}
            </AlertDescription>
          </Alert>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
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
                  <TableCell className="font-medium">Value {valueIdx + 1}</TableCell>
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
          
          {activeOverlapType === 'all' ? (
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <h3 className="font-medium">Choose one value to keep:</h3>
              <RadioGroup 
                value={selectedValueToKeep !== null ? String(selectedValueToKeep) : undefined}
                onValueChange={(value) => setSelectedValueToKeep(Number(value))}
                className="space-y-2"
              >
                {conflictingValues.map((value, valueIdx) => (
                  <div key={value.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(valueIdx)} id={`value-${valueIdx}`} />
                    <label htmlFor={`value-${valueIdx}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Value {valueIdx + 1} ({value.amount} {value.currency})
                    </label>
                  </div>
                ))}
              </RadioGroup>
              <Button 
                onClick={handleSelectValue} 
                disabled={selectedValueToKeep === null}
                className="mt-4"
              >
                Keep Selected Value
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              {activeOverlapType === 'dates' && (
                <>
                  <h3 className="font-medium">Overlapping date ranges:</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentOverlaps().map((dateRange: DateRange, i) => (
                      <Badge key={i} variant="outline">
                        {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              
              {activeOverlapType === 'roomTypes' && (
                <>
                  <h3 className="font-medium">Overlapping room types:</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentOverlaps().map((roomType: RoomType) => (
                      <Badge key={roomType.id} variant="outline">
                        {roomType.name}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              
              {activeOverlapType === 'ratePlans' && (
                <>
                  <h3 className="font-medium">Overlapping rate plans:</h3>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentOverlaps().map((ratePlan: RatePlan) => (
                      <Badge key={ratePlan.id} variant="outline">
                        {ratePlan.name}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              
              <h3 className="font-medium mt-4">Choose which value to modify:</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleRemoveOverlap(0)}
                >
                  Remove from Value 1
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRemoveOverlap(1)}
                >
                  Remove from Value 2
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConflictResolver;
