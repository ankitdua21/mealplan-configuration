
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupplementValue, RoomType, RatePlan } from "@/models/SupplementTypes";
import { roomTypes as defaultRoomTypes, ratePlans as defaultRatePlans } from "@/data/dummyData";
import { Clock } from "lucide-react";

interface ValueListProps {
  values: SupplementValue[];
  onRemove: (id: string) => void;
  roomTypes?: RoomType[];
  ratePlans?: RatePlan[];
}

const ValueList = ({ 
  values, 
  onRemove, 
  roomTypes = defaultRoomTypes, 
  ratePlans = defaultRatePlans 
}: ValueListProps) => {
  if (values.length === 0) {
    return null;
  }

  const formatAmount = (value: SupplementValue) => {
    if (value.parameters.chargeType === "per-room" && value.parameters.roomAmounts) {
      return `${value.parameters.roomAmounts.baseAmount} ${value.currency} per room`;
    } else if (value.parameters.chargeType === "per-adult-child" && value.parameters.occupantAmounts) {
      return `${value.parameters.occupantAmounts.adultAmount} ${value.currency} per adult`;
    } else if (value.parameters.chargeType === "per-occupant" && value.parameters.occupantAmounts) {
      const firstPricing = value.parameters.occupantAmounts.occupancyPricing[0];
      if (firstPricing) {
        return `${firstPricing.amount} ${value.currency} for ${firstPricing.occupantCount} occupant${firstPricing.occupantCount > 1 ? 's' : ''}`;
      }
    }
    return `${value.amount} ${value.currency}`;
  };

  const getChargeTypeDetails = (value: SupplementValue) => {
    if (value.parameters.chargeType === "per-room") {
      const roomAmounts = value.parameters.roomAmounts;
      if (!roomAmounts) return "Per Room";
      
      const extras = [];
      if (roomAmounts.extraAdultAmount > 0) 
        extras.push(`+${roomAmounts.extraAdultAmount} ${value.currency} per extra adult`);
      if (roomAmounts.extraChildAmount > 0) 
        extras.push(`+${roomAmounts.extraChildAmount} ${value.currency} per extra child`);
      if (roomAmounts.extraInfantAmount > 0) 
        extras.push(`+${roomAmounts.extraInfantAmount} ${value.currency} per extra infant`);
      
      return extras.length > 0 
        ? `Per Room (${extras.join(", ")})`
        : "Per Room";
    } else if (value.parameters.chargeType === "per-adult-child") {
      const occupantAmounts = value.parameters.occupantAmounts;
      if (!occupantAmounts) return "Per Adult/Child";
      
      const details = [];
      details.push(`Adult: ${occupantAmounts.adultAmount} ${value.currency}`);
      
      if (occupantAmounts.childAmount > 0) 
        details.push(`Child: ${occupantAmounts.childAmount} ${value.currency}`);
      
      if (occupantAmounts.infantAmount > 0) 
        details.push(`Infant: ${occupantAmounts.infantAmount} ${value.currency}`);
      
      if (occupantAmounts.childAgeRanges && occupantAmounts.childAgeRanges.length > 0) {
        const ageRanges = occupantAmounts.childAgeRanges.map(range => 
          `Ages ${range.minAge}-${range.maxAge}: ${range.amount} ${value.currency}`
        );
        details.push(`Age Ranges: ${ageRanges.join(", ")}`);
      }
      
      return `Per Adult/Child (${details.join(", ")})`;
    } else if (value.parameters.chargeType === "per-occupant") {
      const occupantAmounts = value.parameters.occupantAmounts;
      if (!occupantAmounts || !occupantAmounts.occupancyPricing) return "Per Occupant";
      
      const pricing = occupantAmounts.occupancyPricing.map(p => 
        `${p.occupantCount} occupant${p.occupantCount > 1 ? 's' : ''}: ${p.amount} ${value.currency}`
      );
      
      return pricing.length > 0 
        ? `Per Occupant (${pricing.join(", ")})`
        : "Per Occupant";
    }
    
    return value.parameters.chargeType;
  };

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
              <TableHead>Description</TableHead>
              <TableHead>Date Ranges</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Room Types</TableHead>
              <TableHead>Rate Plans</TableHead>
              <TableHead>Charge Type</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((value) => (
              <TableRow key={value.id}>
                <TableCell>
                  {formatAmount(value)}
                </TableCell>
                <TableCell>
                  {value.parameters.description || "-"}
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
                  {value.parameters.daysOfWeek && value.parameters.daysOfWeek.length > 0 ? (
                    value.parameters.daysOfWeek.length === 7 ? (
                      <span className="text-muted-foreground">All days</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {value.parameters.daysOfWeek.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </Badge>
                        ))}
                      </div>
                    )
                  ) : (
                    <span className="text-muted-foreground">All days</span>
                  )}
                </TableCell>
                <TableCell>
                  {value.parameters.roomTypes.length === 0 || 
                   (value.parameters.roomTypes.length === roomTypes.length) ? (
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
                  {value.parameters.ratePlans.length === 0 ||
                   (value.parameters.ratePlans.length === ratePlans.length) ? (
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
                  <Badge className="whitespace-normal text-xs">
                    {getChargeTypeDetails(value)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {value.parameters.leadTime ? (
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{value.parameters.leadTime} days</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
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
