
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Conflict, SupplementValue } from "@/models/SupplementTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface ConflictResolverProps {
  conflicts: Conflict[];
  values: SupplementValue[];
  onResolve: (resolvedValues: SupplementValue[]) => void;
  onCancel: () => void;
}

const ConflictResolver = ({ conflicts, values, onResolve, onCancel }: ConflictResolverProps) => {
  const [priorities, setPriorities] = useState<Record<string, number>>(
    values.reduce((acc, value) => {
      acc[value.id] = value.priority || 0;
      return acc;
    }, {} as Record<string, number>)
  );

  const handlePriorityChange = (id: string, priority: number) => {
    setPriorities((prev) => ({
      ...prev,
      [id]: priority,
    }));
  };

  const handleResolve = () => {
    const resolvedValues = values.map((value) => ({
      ...value,
      priority: priorities[value.id],
    }));
    onResolve(resolvedValues);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conflicts Detected</CardTitle>
        <CardDescription>
          We found conflicts in your mealplan values. Please assign priorities to resolve them.
          Higher priority values will take precedence when there is overlapping criteria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {conflicts.map((conflict, index) => {
            const conflictingValues = values.filter((v) => 
              conflict.valueIds.includes(v.id)
            );
            
            return (
              <div key={index} className="space-y-4">
                <Alert variant="destructive">
                  <AlertTitle>Conflict {index + 1}</AlertTitle>
                  <AlertDescription>
                    The following values have overlapping parameters: {" "}
                    <strong>{conflict.conflictingParameters.join(", ")}</strong>
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
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflictingValues.map((value) => (
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
                          {value.parameters.roomTypes.length > 0 ? (
                            value.parameters.roomTypes.map((type) => type.name).join(", ")
                          ) : (
                            <span className="text-muted-foreground">All room types</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {value.parameters.ratePlans.length > 0 ? (
                            value.parameters.ratePlans.map((plan) => plan.name).join(", ")
                          ) : (
                            <span className="text-muted-foreground">All rate plans</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {value.parameters.chargeType === "per-room"
                            ? "Per Room"
                            : "Per Occupant"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={priorities[value.id] || ""}
                            onChange={(e) => handlePriorityChange(value.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleResolve}>
          Resolve Conflicts & Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConflictResolver;
