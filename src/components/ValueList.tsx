
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SupplementValue } from "@/models/SupplementTypes";

interface ValueListProps {
  values: SupplementValue[];
  onRemove: (id: string) => void;
}

const ValueList = ({ values, onRemove }: ValueListProps) => {
  if (values.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mealplan Values</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Date Ranges</TableHead>
              <TableHead>Room Types</TableHead>
              <TableHead>Rate Plans</TableHead>
              <TableHead>Charge Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((value) => (
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
                  <div className="flex flex-wrap gap-1">
                    {value.parameters.roomTypes.length > 0 ? (
                      value.parameters.roomTypes.map((type) => (
                        <Badge key={type.id} variant="outline" className="text-xs">
                          {type.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">All room types</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {value.parameters.ratePlans.length > 0 ? (
                      value.parameters.ratePlans.map((plan) => (
                        <Badge key={plan.id} variant="outline" className="text-xs">
                          {plan.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">All rate plans</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>
                    {value.parameters.chargeType === "per-room"
                      ? "Per Room"
                      : value.parameters.chargeType === "per-adult"
                      ? "Per Adult"
                      : "Per Occupant"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {value.priority || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(value.id)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ValueList;
