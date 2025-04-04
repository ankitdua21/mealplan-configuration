
import { Check, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SuccessAlertProps {
  onAddAnother: () => void;
}

const SuccessAlert = ({ onAddAnother }: SuccessAlertProps) => {
  return (
    <Alert className="bg-green-50 border-green-200">
      <Check className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700 flex justify-between items-center">
        <span>Value added successfully! You can add more values or save your mealplan.</span>
        <Button
          size="sm"
          variant="outline"
          className="ml-4 border-green-300 text-green-700"
          onClick={onAddAnother}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Another Value
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SuccessAlert;
