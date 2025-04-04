
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Supplement } from "@/models/SupplementTypes";
import ValueList from "./ValueList";
import { Badge } from "@/components/ui/badge";

interface SavedSupplementProps {
  supplement: Supplement;
}

const SavedSupplement = ({ supplement }: SavedSupplementProps) => {
  const getMealsIncluded = () => {
    if (!supplement.mealIncluded) return [];
    
    const meals = [];
    if (supplement.mealIncluded.breakfast) meals.push("Breakfast");
    if (supplement.mealIncluded.lunch) meals.push("Lunch");
    if (supplement.mealIncluded.dinner) meals.push("Dinner");
    return meals;
  };

  const mealsIncluded = getMealsIncluded();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>{supplement.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-normal">
              Code: {supplement.code}
            </Badge>
            {mealsIncluded.length > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                Meals Included: {mealsIncluded.join(", ")}
              </Badge>
            )}
          </div>
        </div>
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
