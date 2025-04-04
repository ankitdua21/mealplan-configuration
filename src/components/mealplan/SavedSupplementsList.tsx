
import { Button } from "@/components/ui/button";
import { Supplement } from "@/models/SupplementTypes";
import SavedSupplement from "../SavedSupplement";

interface SavedSupplementsListProps {
  supplements: Supplement[];
  onClearAll: () => void;
}

const SavedSupplementsList = ({ supplements, onClearAll }: SavedSupplementsListProps) => {
  if (supplements.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Saved Mealplans</h2>
        <Button 
          variant="outline" 
          onClick={onClearAll}
          className="text-sm"
        >
          Clear All
        </Button>
      </div>
      <div className="space-y-4">
        {supplements.map(supplement => (
          <SavedSupplement key={supplement.id} supplement={supplement} />
        ))}
      </div>
    </div>
  );
};

export default SavedSupplementsList;
