
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Conflict, SupplementValue, DateRange, RoomType, RatePlan } from "@/models/SupplementTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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

  // Function to handle conflict resolution
  const handleResolveConflict = () => {
    // Create a deep copy of the values
    const updatedValues = JSON.parse(JSON.stringify(resolvedValues)) as SupplementValue[];
    
    // Get values to adjust
    const value1Id = conflict?.valueIds[0];
    const value2Id = conflict?.valueIds[1];
    
    if (!value1Id || !value2Id) {
      toast({
        title: "Error",
        description: "Could not find conflict information",
        variant: "destructive",
      });
      return;
    }

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
    if (conflict?.conflictingParameters.includes("dateRanges")) {
      // If either value has empty date ranges (all dates), make value2 have specific dates
      // that don't overlap with value1
      if (value1.parameters.dateRanges.length === 0) {
        // If value1 applies to all dates, create a sample date range for value2
        // This is a simplification - in a real scenario, you might want to handle this differently
        if (value2.parameters.dateRanges.length === 0) {
          // Both have all dates, give value2 specific dates
          const today = new Date();
          const nextYear = new Date();
          nextYear.setFullYear(today.getFullYear() + 1);
          
          value2.parameters.dateRanges = [{
            id: crypto.randomUUID(),
            startDate: nextYear,
            endDate: new Date(nextYear.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days after next year
          }];
        }
        // If value2 already has specific dates, we'll keep them as they are
      } else if (value2.parameters.dateRanges.length === 0) {
        // value2 applies to all dates, but value1 has specific dates
        // Make value2 apply to all dates EXCEPT those in value1
        const complementaryDates: DateRange[] = [];
        
        // For each date range in value1, create ranges before and after
        value1.parameters.dateRanges.forEach(range1 => {
          const beforeRange = {
            id: crypto.randomUUID(),
            startDate: new Date(0), // Beginning of time
            endDate: new Date(new Date(range1.startDate).getTime() - 24 * 60 * 60 * 1000) // Day before range1 starts
          };
          
          const afterRange = {
            id: crypto.randomUUID(),
            startDate: new Date(new Date(range1.endDate).getTime() + 24 * 60 * 60 * 1000), // Day after range1 ends
            endDate: new Date(new Date().getFullYear() + 100, 11, 31) // Far in the future
          };
          
          // Only add valid ranges (where start is before end)
          if (beforeRange.startDate < beforeRange.endDate) {
            complementaryDates.push(beforeRange);
          }
          
          if (afterRange.startDate < afterRange.endDate) {
            complementaryDates.push(afterRange);
          }
        });
        
        value2.parameters.dateRanges = complementaryDates;
      } else {
        // Both have specific date ranges, remove overlapping ones from value2
        for (let i = value2.parameters.dateRanges.length - 1; i >= 0; i--) {
          const range2 = value2.parameters.dateRanges[i];
          let hasOverlap = false;
          
          for (const range1 of value1.parameters.dateRanges) {
            if (new Date(range1.startDate) <= new Date(range2.endDate) && 
                new Date(range1.endDate) >= new Date(range2.startDate)) {
              // There's an overlap, remove this range from value2
              hasOverlap = true;
              break;
            }
          }
          
          if (hasOverlap) {
            value2.parameters.dateRanges.splice(i, 1);
          }
        }
      }
    }
    
    // Resolve room type conflicts if needed
    if (conflict?.conflictingParameters.includes("roomTypes")) {
      // If either value has empty room types (all room types), adjust value2
      if (value1.parameters.roomTypes.length === 0) {
        // value1 applies to all room types
        // If value2 also applies to all room types, give it specific room types
        if (value2.parameters.roomTypes.length === 0) {
          // This is a simplification - in a real app, you might want to get actual available room types
          value2.parameters.roomTypes = [{
            id: crypto.randomUUID(),
            name: "Special Suite"
          }];
        }
        // Otherwise, keep value2's specific room types
      } else if (value2.parameters.roomTypes.length === 0) {
        // value2 applies to all room types, but value1 has specific room types
        // Make value2 apply to all room types EXCEPT those in value1
        value2.parameters.roomTypes = [{
          id: crypto.randomUUID(),
          name: "All Other Room Types"
        }];
      } else {
        // Both have specific room types, remove overlapping ones from value2
        value2.parameters.roomTypes = value2.parameters.roomTypes.filter(rt2 => 
          !value1.parameters.roomTypes.some(rt1 => rt1.id === rt2.id)
        );
      }
    }
    
    // Resolve rate plan conflicts if needed
    if (conflict?.conflictingParameters.includes("ratePlans")) {
      // If either value has empty rate plans (all rate plans), adjust value2
      if (value1.parameters.ratePlans.length === 0) {
        // value1 applies to all rate plans
        // If value2 also applies to all rate plans, give it specific rate plans
        if (value2.parameters.ratePlans.length === 0) {
          // This is a simplification
          value2.parameters.ratePlans = [{
            id: crypto.randomUUID(),
            name: "Special Offer"
          }];
        }
        // Otherwise, keep value2's specific rate plans
      } else if (value2.parameters.ratePlans.length === 0) {
        // value2 applies to all rate plans, but value1 has specific rate plans
        // Make value2 apply to all rate plans EXCEPT those in value1
        value2.parameters.ratePlans = [{
          id: crypto.randomUUID(),
          name: "All Other Rate Plans"
        }];
      } else {
        // Both have specific rate plans, remove overlapping ones from value2
        value2.parameters.ratePlans = value2.parameters.ratePlans.filter(rp2 => 
          !value1.parameters.ratePlans.some(rp1 => rp1.id === rp2.id)
        );
      }
    }
    
    // Check for remaining conflicts after this resolution
    setResolvedValues(updatedValues);
    
    // Detect remaining conflicts
    const newConflicts = detectConflicts(updatedValues);
    
    if (newConflicts.length > 0) {
      // Still have conflicts, move to the next one
      setRemainingConflicts(newConflicts);
      setCurrentConflictIndex(0);
      
      toast({
        title: "Conflict partially resolved",
        description: "Removed overlapping parameters. Additional conflicts still need to be resolved.",
      });
    } else {
      // No more conflicts, save the mealplan directly
      toast({
        title: "All conflicts resolved",
        description: "Saving your mealplan with adjusted parameters.",
      });
      
      // Call the onResolve callback with the resolved values
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
          (range1, range2) => {
            const start1 = new Date(range1.startDate);
            const end1 = new Date(range1.endDate);
            const start2 = new Date(range2.startDate);
            const end2 = new Date(range2.endDate);
            return start1 <= end2 && end1 >= start2;
          }
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

  // If there's no conflict or no values to resolve, show loading
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conflicts Detected</CardTitle>
        <CardDescription>
          {/* Removed the sentence as requested */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conflict {currentConflictIndex + 1} of {remainingConflicts.length}</AlertTitle>
            <AlertDescription>
              These values have overlapping dates, room types, and rate plans. Click "Remove Overlap" to automatically adjust the parameters to avoid conflicts.
            </AlertDescription>
          </Alert>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
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
                  <TableCell className="max-w-[200px]">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="block truncate font-medium cursor-help">
                          {value.parameters.description || "No description"}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <p>{value.parameters.description || "No description"}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
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
