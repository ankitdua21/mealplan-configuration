
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Conflict, SupplementValue } from "@/models/SupplementTypes";
import { Info } from "lucide-react";

interface ConflictResolverProps {
  conflicts: Conflict[];
  values: SupplementValue[];
  onResolve: (resolvedValues: SupplementValue[]) => void;
  onCancel: () => void;
}

const ConflictResolver = ({ conflicts, values, onResolve, onCancel }: ConflictResolverProps) => {
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  
  const getValueById = (id: string) => values.find(v => v.id === id);
  
  const handleResolutionChange = (conflictKey: string, valueId: string) => {
    setResolutions(prev => ({
      ...prev,
      [conflictKey]: valueId
    }));
  };
  
  const isAllResolved = () => {
    return conflicts.every(conflict => {
      const conflictKey = conflict.valueIds.join('-');
      return resolutions[conflictKey];
    });
  };
  
  const handleResolve = () => {
    const resolvedValues = [...values];
    
    // For each conflict, we'll modify the appropriate values
    conflicts.forEach(conflict => {
      const conflictKey = conflict.valueIds.join('-');
      const prioritizedValueId = resolutions[conflictKey];
      
      if (!prioritizedValueId) return;
      
      const otherValueId = conflict.valueIds.find(id => id !== prioritizedValueId);
      if (!otherValueId) return;
      
      const prioritizedValueIndex = resolvedValues.findIndex(v => v.id === prioritizedValueId);
      const otherValueIndex = resolvedValues.findIndex(v => v.id === otherValueId);
      
      if (prioritizedValueIndex === -1 || otherValueIndex === -1) return;
      
      const otherValue = { ...resolvedValues[otherValueIndex] };
      
      // Remove overlapping date ranges
      if (conflict.conflictingParameters.includes('dateRanges')) {
        const prioritizedRanges = resolvedValues[prioritizedValueIndex].parameters.dateRanges;
        const otherRanges = [...otherValue.parameters.dateRanges];
        
        const newOtherRanges = otherRanges.filter(range1 => {
          return !prioritizedRanges.some(range2 => 
            (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate));
        });
        
        otherValue.parameters = {
          ...otherValue.parameters,
          dateRanges: newOtherRanges
        };
      }
      
      // Remove overlapping room types
      if (conflict.conflictingParameters.includes('roomTypes')) {
        const prioritizedRoomTypes = resolvedValues[prioritizedValueIndex].parameters.roomTypes;
        const otherRoomTypes = [...otherValue.parameters.roomTypes];
        
        const newOtherRoomTypes = otherRoomTypes.filter(type1 => {
          return !prioritizedRoomTypes.some(type2 => type1.id === type2.id);
        });
        
        otherValue.parameters = {
          ...otherValue.parameters,
          roomTypes: newOtherRoomTypes
        };
      }
      
      // Remove overlapping rate plans
      if (conflict.conflictingParameters.includes('ratePlans')) {
        const prioritizedRatePlans = resolvedValues[prioritizedValueIndex].parameters.ratePlans;
        const otherRatePlans = [...otherValue.parameters.ratePlans];
        
        const newOtherRatePlans = otherRatePlans.filter(plan1 => {
          return !prioritizedRatePlans.some(plan2 => plan1.id === plan2.id);
        });
        
        otherValue.parameters = {
          ...otherValue.parameters,
          ratePlans: newOtherRatePlans
        };
      }
      
      resolvedValues[otherValueIndex] = otherValue;
    });
    
    onResolve(resolvedValues);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resolve Conflicts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">Conflicts Detected</h3>
              <p className="text-sm text-amber-700 mt-1">
                We found conflicts between some of your mealplan values. Please select which value should take precedence in each case.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {conflicts.map((conflict, index) => {
            const value1 = getValueById(conflict.valueIds[0]);
            const value2 = getValueById(conflict.valueIds[1]);
            if (!value1 || !value2) return null;
            
            const conflictKey = conflict.valueIds.join('-');
            const selectedValueId = resolutions[conflictKey];
            
            return (
              <div key={index} className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Conflict {index + 1}</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <RadioGroup 
                          value={selectedValueId} 
                          onValueChange={(value) => handleResolutionChange(conflictKey, value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={value1.id} id={`${value1.id}-option`} />
                          </div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell>
                        {value1.parameters.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Charge Type: {value1.parameters.chargeType}</div>
                          <div>Date Ranges: {value1.parameters.dateRanges.length || "All"}</div>
                          <div>Room Types: {value1.parameters.roomTypes.length || "All"}</div>
                          <div>Rate Plans: {value1.parameters.ratePlans.length || "All"}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <RadioGroup 
                          value={selectedValueId} 
                          onValueChange={(value) => handleResolutionChange(conflictKey, value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={value2.id} id={`${value2.id}-option`} />
                          </div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell>
                        {value2.parameters.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Charge Type: {value2.parameters.chargeType}</div>
                          <div>Date Ranges: {value2.parameters.dateRanges.length || "All"}</div>
                          <div>Room Types: {value2.parameters.roomTypes.length || "All"}</div>
                          <div>Rate Plans: {value2.parameters.ratePlans.length || "All"}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>
                    <span className="font-medium">Conflicting parameters:</span>{" "}
                    {conflict.conflictingParameters.join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolve} 
            disabled={!isAllResolved()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Resolve & Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConflictResolver;
