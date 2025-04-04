import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Coffee, UtensilsCrossed, Soup } from "lucide-react";
import { supplementTypes } from "@/data/dummyData";
import { Button } from "@/components/ui/button";

interface MealplanHeaderProps {
  description: string;
  setDescription: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  mealIncluded: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  setMealIncluded: (value: { breakfast: boolean; lunch: boolean; dinner: boolean }) => void;
  hasSavedSupplements: boolean;
}

const MealplanHeader = ({
  description,
  setDescription,
  code,
  setCode,
  mealIncluded,
  setMealIncluded,
  hasSavedSupplements
}: MealplanHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Configure New Supplement</CardTitle>
          {hasSavedSupplements && (
            <div className="text-sm text-muted-foreground flex items-center">
              <Info size={16} className="mr-1" />
              You can create multiple mealplan supplements
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6 flex-nowrap overflow-x-auto pb-2">
          {supplementTypes.map((type) => (
            <Button
              key={type.id}
              variant={type.type === "mealplan" ? "default" : "outline"}
              className="h-16 flex-shrink-0 min-w-[120px]"
              disabled={type.type !== "mealplan"}
            >
              {type.name}
            </Button>
          ))}
        </div>
        
        <Separator className="my-6" />
        
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
            <div className="flex-1">
              <Label htmlFor="description" className="flex items-center text-base font-medium">
                Mealplan Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter mealplan name"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="code" className="flex items-center text-base font-medium">
                Code <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Enter mealplan code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex-1">
              <Label className="flex items-center text-base font-medium">
                Meal Included <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex flex-wrap gap-4 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="breakfast" 
                    checked={mealIncluded.breakfast}
                    onCheckedChange={(checked) => 
                      setMealIncluded(prev => ({...prev, breakfast: checked === true}))
                    }
                  />
                  <Label htmlFor="breakfast" className="font-normal flex items-center gap-1">
                    <Coffee size={16} /> Breakfast
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lunch" 
                    checked={mealIncluded.lunch}
                    onCheckedChange={(checked) => 
                      setMealIncluded(prev => ({...prev, lunch: checked === true}))
                    }
                  />
                  <Label htmlFor="lunch" className="font-normal flex items-center gap-1">
                    <UtensilsCrossed size={16} /> Lunch
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dinner" 
                    checked={mealIncluded.dinner}
                    onCheckedChange={(checked) => 
                      setMealIncluded(prev => ({...prev, dinner: checked === true}))
                    }
                  />
                  <Label htmlFor="dinner" className="font-normal flex items-center gap-1">
                    <Soup size={16} /> Dinner
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealplanHeader;
