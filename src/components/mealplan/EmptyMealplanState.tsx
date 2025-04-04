
import { Info } from "lucide-react";

const EmptyMealplanState = () => {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-6 mt-6">
      <div className="flex items-center justify-center flex-col text-center">
        <Info size={24} className="text-gray-400 mb-2" />
        <h3 className="text-lg font-medium mb-1">Create Multiple Mealplans</h3>
        <p className="text-muted-foreground max-w-md">
          You can create multiple different mealplan supplements. After saving each mealplan, 
          the form will reset so you can configure another one.
        </p>
      </div>
    </div>
  );
};

export default EmptyMealplanState;
