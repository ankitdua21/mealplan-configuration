import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Conflict, SupplementValue, DateRange, RoomType, RatePlan } from "@/models/SupplementTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ConflictResolverProps {
  conflicts: Conflict[];
  values: SupplementValue[];
  onResolve: (resolvedValues: SupplementValue[]) => void;
  onCancel: () => void;
}

const ConflictResolver = ({ conflicts, values, onResolve, onCancel }: ConflictResolverProps) => {
  const [resolvedValues, setResolvedValues] = useState<SupplementValue[]>([...values]);
  const [remainingConflicts, setRemainingConflicts] = useState<Conflict[]>([...conflicts]);
  const [currentConflictIndex, setCurrentConflictIndex] = useState<number>(0);
  const { toast } = useToast();

  // Reset conflict resolution when component mounts or when conflicts change
  useEffect(() => {
    setResolvedValues([...values]);
    setRemainingConflicts([...conflicts]);
    setCurrentConflictIndex(0);
  }, [conflicts, values]);

  // If there's no conflict or no values to resolve, redirect to completion
  if (remainingConflicts.length === 0) {
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
          <Button onClick={() => onResolve(resolvedValues)}>
            Save Mealplan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Get current conflict and conflicting values
  const getCurrentConflictData = () => {
    if (remainingConflicts.length === 0) return { conflict: null, conflictingValues: [] };
    
    const conflict = remainingConflicts[currentConflictIndex];
    if (!conflict) return { conflict: null, conflictingValues: [] };
    
    const conflictingValues = conflict.valueIds.map(id => 
      resolvedValues.find(v => v.id === id)
    ).filter(Boolean) as SupplementValue[];
    
    return { conflict, conflictingValues };
  };

  const { conflict, conflictingValues } = getCurrentConflictData();
  
  if (!conflict || conflictingValues.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Processing Conflicts</CardTitle>
          <CardDescription>
            Please wait...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Function to automatically resolve the current conflict
  const handleResolveConflict = () => {
    // Create a deep copy of the values
    const updatedValues = JSON.parse(JSON.stringify(resolvedValues)) as SupplementValue[];
    
    // Get values to adjust
    const value1Id = conflict.valueIds[0];
    const value2Id = conflict.valueIds[1];
    
    const value1Index = updatedValues.findIndex(v => v.id === value1Id);
    const value2Index = updatedValues.findIndex(v => v.id === value2Id);
    
    if (value1Index === -1 || value2Index === -1) {
      toast({
        title: "Error",
        description: "Could not find the conflicting values",
        variant: "destructive",
      });
      return;
    }
    
    // Keep value1 but modify value2 to avoid overlaps
    const value1 = updatedValues[value1Index];
    const value2 = updatedValues[value2Index];
    
    // Resolve date range conflicts if needed
    if (conflict.conflictingParameters.includes("dateRanges")) {
      // If either value has empty date ranges (all dates), make value2 have no dates
      if (value1.parameters.dateRanges.length === 0 || value2.parameters.dateRanges.length === 0) {
        value2.parameters.dateRanges = [];
      } else {
        // Remove overlapping date ranges from value2
        for (let i = value2.parameters.dateRanges.length - 1; i >= 0; i--) {
          const range2 = value2.parameters.dateRanges[i];
          
          for (const range1 of value1.parameters.dateRanges) {
            if (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate) {
              // Remove the overlapping range
              value2.parameters.dateRanges.splice(i, 1);
              break;
            }
          }
        }
      }
    }
    
    // Resolve room type conflicts if needed
    if (conflict.conflictingParameters.includes("roomTypes")) {
      // If either value has empty room types (all room types), make value2 have no room types
      if (value1.parameters.roomTypes.length === 0 || value2.parameters.roomTypes.length === 0) {
        value2.parameters.roomTypes = [];
      } else {
        // Remove overlapping room types from value2
        value2.parameters.roomTypes = value2.parameters.roomTypes.filter(rt2 => 
          !value1.parameters.roomTypes.some(rt1 => rt1.id === rt2.id)
        );
      }
    }
    
    // Resolve rate plan conflicts if needed
    if (conflict.conflictingParameters.includes("ratePlans")) {
      // If either value has empty rate plans (all rate plans), make value2 have no rate plans
      if (value1.parameters.ratePlans.length === 0 || value2.parameters.ratePlans.length === 0) {
        value2.parameters.ratePlans = [];
      } else {
        // Remove overlapping rate plans from value2
        value2.parameters.ratePlans = value2.parameters.ratePlans.filter(rp2 => 
          !value1.parameters.ratePlans.some(rp1 => rp1.id === rp2.id)
        );
      }
    }
    
    // If value2 now has no dates, no room types, or no rate plans, remove it completely
    if (
      (value2.parameters.dateRanges.length === 0 && value1.parameters.dateRanges.length === 0) ||
      (value2.parameters.roomTypes.length === 0 && value1.parameters.roomTypes.length === 0) ||
      (value2.parameters.ratePlans.length === 0 && value1.parameters.ratePlans.length === 0)
    ) {
      updatedValues.splice(value2Index, 1);
      toast({
        title: "Conflict resolved",
        description: "One value was completely overlapping with another and has been removed.",
      });
    } else {
      toast({
        title: "Conflict resolved",
        description: "Overlapping parameters have been removed from one of the values.",
      });
    }
    
    // Check for remaining conflicts in the updated values
    const newConflicts = detectConflicts(updatedValues);
    
    if (newConflicts.length > 0) {
      // Move to the next conflict
      setResolvedValues(updatedValues);
      setRemainingConflicts(newConflicts);
      setCurrentConflictIndex(0);
    } else {
      // No more conflicts, proceed to save
      onResolve(updatedValues);
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
        
        // Check date range conflicts
        const hasDateRangeConflict = hasOverlap(
          value1.parameters.dateRanges, 
          value2.parameters.dateRanges,
          (range1, range2) => range1.startDate <= range2.endDate && range1.endDate >= range2.startDate
        );
        
        if (hasDateRangeConflict) {
          conflictingParameters.push("dateRanges");
        }
        
        // Check room type conflicts
        const hasRoomTypeConflict = hasOverlap(
          value1.parameters.roomTypes,
          value2.parameters.roomTypes,
          (rt1, rt2) => rt1.id === rt2.id
        );
        
        if (hasRoomTypeConflict) {
          conflictingParameters.push("roomTypes");
        }
        
        // Check rate plan conflicts
        const hasRatePlanConflict = hasOverlap(
          value1.parameters.ratePlans,
          value2.parameters.ratePlans,
          (rp1, rp2) => rp1.id === rp2.id
        );
        
        if (hasRatePlanConflict) {
          conflictingParameters.push("ratePlans");
        }
        
        // Only add conflict if all parameter types have overlaps
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

  // Generic function to check for overlaps
  function hasOverlap<T>(array1: T[], array2: T[], compareFn: (item1: T, item2: T) => boolean): boolean {
    // If either array is empty, consider it as "all values" which always overlaps
    if (array1.length === 0 || array2.length === 0) {
      return true;
    }
    
    // Check for specific overlaps
    for (const item1 of array1) {
      for (const item2 of array2) {
        if (compareFn(item1, item2)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Helper function to display charge type
  const getChargeTypeDisplay = (chargeType: string) => {
    switch(chargeType) {
      case "per-room": return "Per Room";
      case "per-adult-child": return "Per Adult/Child";
      case "per-occupant": return "Per Occupant";
      default: return chargeType;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conflicts Detected</CardTitle>
        <CardDescription>
          We found conflicting values in your mealplan. These values have overlapping parameters which could cause unexpected behavior.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conflict {currentConflictIndex + 1} of {remainingConflicts.length}</AlertTitle>
            <AlertDescription>
              These values have overlapping dates, room types, and rate plans. Click "Remove Overlap" to automatically resolve the conflict.
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
                            {format(new Date(range.startDate), "MMM d, yyyy")} - {format(new Date(range.endDate), "MMM d, yyyy")}
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
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleResolveConflict}
              className="w-full max-w-md"
            >
              Remove Overlap
            </Button>
          </div>
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
