
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Supplement } from "@/models/SupplementTypes";
import ValueList from "./ValueList";

interface SavedSupplementProps {
  supplement: Supplement;
}

const SavedSupplement = ({ supplement }: SavedSupplementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{supplement.name}</CardTitle>
        <CardDescription>{supplement.description}</CardDescription>
      </CardHeader>
      <CardContent>
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
