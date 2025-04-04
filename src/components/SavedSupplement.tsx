
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Supplement } from "@/models/SupplementTypes";
import ValueList from "./ValueList";
import { Clock } from "lucide-react";

interface SavedSupplementProps {
  supplement: Supplement;
}

const SavedSupplement = ({ supplement }: SavedSupplementProps) => {
  // Check if any values have lead time
  const hasLeadTime = supplement.values.some(value => 
    value.parameters.leadTime !== undefined && value.parameters.leadTime > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{supplement.name}</CardTitle>
        <CardDescription>{supplement.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasLeadTime && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Booking Window:</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={16} className="mr-2" />
              Lead Time: {supplement.values.find(v => v.parameters.leadTime !== undefined)?.parameters.leadTime} days
            </div>
            <Separator className="my-4" />
          </div>
        )}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Configured Values:</h3>
          <ValueList values={supplement.values} onRemove={() => {}} />
        </div>
        <Separator className="my-4" />
      </CardContent>
    </Card>
  );
};

export default SavedSupplement;
