import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Conflict, Supplement, SupplementValue } from "@/models/SupplementTypes";
import { roomTypes, ratePlans, supplementTypes } from "@/data/dummyData";
import ValueForm from "./ValueForm";
import ValueList from "./ValueList";
import ConflictResolver from "./ConflictResolver";
import { useToast } from "@/hooks/use-toast";
import MealplanHeader from "./mealplan/MealplanHeader";
import SavedSupplementsList from "./mealplan/SavedSupplementsList";
import EmptyMealplanState from "./mealplan/EmptyMealplanState";
import SuccessAlert from "./mealplan/SuccessAlert";

const MealplanSupplements = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [mealIncluded, setMealIncluded] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });
  const [values, setValues] = useState<SupplementValue[]>([]);
  const [savedSupplements, setSavedSupplements] = useState<Supplement[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [currentValue, setCurrentValue] = useState<SupplementValue | null>(null);
  const [showAddMorePrompt, setShowAddMorePrompt] = useState(false);

  const handleAddValue = (value: SupplementValue) => {
    setValues((prev) => [...prev, value]);
    setCurrentValue(null);
    setShowAddMorePrompt(true);
  };

  const handleRemoveValue = (id: string) => {
    setValues((prev) => prev.filter((v) => v.id !== id));
    setShowAddMorePrompt(values.length > 1);
  };

  const detectConflicts = (values: SupplementValue[]): Conflict[] => {
    const conflicts: Conflict[] = [];
    
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const value1 = values[i];
        const value2 = values[j];
        const conflictingParameters: Array<keyof Omit<typeof value1.parameters, 'id' | 'condition' | 'chargeType'>> = [];
        
        const dateRanges1 = value1.parameters.dateRanges;
        const dateRanges2 = value2.parameters.dateRanges;
        
        let dateRangeConflict = false;
        if (dateRanges1.length === 0 || dateRanges2.length === 0) {
          dateRangeConflict = true;
        } else {
          for (const range1 of dateRanges1) {
            for (const range2 of dateRanges2) {
              if (
                (range1.startDate <= range2.endDate && range1.endDate >= range2.startDate) ||
                (range2.startDate <= range1.endDate && range2.endDate >= range1.startDate)
              ) {
                dateRangeConflict = true;
                break;
              }
            }
            if (dateRangeConflict) break;
          }
        }
        
        if (dateRangeConflict) {
          conflictingParameters.push("dateRanges");
        }
        
        const roomTypes1 = value1.parameters.roomTypes;
        const roomTypes2 = value2.parameters.roomTypes;
        
        let roomTypeConflict = false;
        if (roomTypes1.length === 0 || roomTypes2.length === 0) {
          roomTypeConflict = true;
        } else {
          for (const type1 of roomTypes1) {
            for (const type2 of roomTypes2) {
              if (type1.id === type2.id) {
                roomTypeConflict = true;
                break;
              }
            }
            if (roomTypeConflict) break;
          }
        }
        
        if (roomTypeConflict) {
          conflictingParameters.push("roomTypes");
        }
        
        const ratePlans1 = value1.parameters.ratePlans;
        const ratePlans2 = value2.parameters.ratePlans;
        
        let ratePlanConflict = false;
        if (ratePlans1.length === 0 || ratePlans2.length === 0) {
          ratePlanConflict = true;
        } else {
          for (const plan1 of ratePlans1) {
            for (const plan2 of ratePlans2) {
              if (plan1.id === plan2.id) {
                ratePlanConflict = true;
                break;
              }
            }
            if (ratePlanConflict) break;
          }
        }
        
        if (ratePlanConflict) {
          conflictingParameters.push("ratePlans");
        }
        
        if (conflictingParameters.length === 3) {
          conflicts.push({
            valueIds: [value1.id, value2.id],
            conflictingParameters,
          });
        }
      }
    }
    
    return conflicts;
  };

  const handleValueSubmit = (value: SupplementValue) => {
    setCurrentValue(value);
  };

  const handleSave = () => {
    if (!description) {
      toast({
        title: "Error",
        description: "Please enter a mealplan name",
        variant: "destructive",
      });
      return;
    }

    if (!code) {
      toast({
        title: "Error",
        description: "Please enter a mealplan code",
        variant: "destructive",
      });
      return;
    }

    if (!mealIncluded.breakfast && !mealIncluded.lunch && !mealIncluded.dinner) {
      toast({
        title: "Error",
        description: "Please select at least one meal type",
        variant: "destructive",
      });
      return;
    }
    
    const valuesToSave = [...values];
    if (currentValue) {
      valuesToSave.push(currentValue);
    }
    
    if (valuesToSave.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one value",
        variant: "destructive",
      });
      return;
    }
    
    const detectedConflicts = detectConflicts(valuesToSave);
    
    if (detectedConflicts.length > 0) {
      if (currentValue) {
        setValues(valuesToSave);
      }
      setConflicts(detectedConflicts);
      setShowConflictResolver(true);
      return;
    }
    
    saveWithoutConflicts(valuesToSave);
  };

  const saveWithoutConflicts = (valuesToSave: SupplementValue[]) => {
    const supplement: Supplement = {
      id: crypto.randomUUID(),
      name: "Mealplan",
      type: "mealplan",
      description: description,
      code: code,
      mealIncluded: mealIncluded,
      values: valuesToSave,
    };
    
    setSavedSupplements(prev => [...prev, supplement]);
    toast({
      title: "Success",
      description: "Mealplan supplement has been saved successfully.",
    });
    
    setDescription("");
    setCode("");
    setMealIncluded({
      breakfast: false,
      lunch: false,
      dinner: false
    });
    setValues([]);
    setCurrentValue(null);
    setConflicts([]);
    setShowConflictResolver(false);
    setShowAddMorePrompt(false);
  };

  const handleResolveConflicts = (resolvedValues: SupplementValue[]) => {
    saveWithoutConflicts(resolvedValues);
  };

  const scrollToValueForm = () => {
    document.getElementById('valueForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <SavedSupplementsList 
        supplements={savedSupplements} 
        onClearAll={() => setSavedSupplements([])} 
      />
      
      {showConflictResolver ? (
        <ConflictResolver
          conflicts={conflicts}
          values={currentValue ? [...values, currentValue] : values}
          onResolve={handleResolveConflicts}
          onCancel={() => setShowConflictResolver(false)}
        />
      ) : (
        <div className="space-y-8">
          <MealplanHeader
            description={description}
            setDescription={setDescription}
            code={code}
            setCode={setCode}
            mealIncluded={mealIncluded}
            setMealIncluded={setMealIncluded}
            hasSavedSupplements={savedSupplements.length > 0}
          />
          
          <ValueForm
            roomTypes={roomTypes}
            ratePlans={ratePlans}
            onAdd={handleAddValue}
          />
          
          {values.length > 0 && (
            <>
              <ValueList values={values} onRemove={handleRemoveValue} />
              
              {showAddMorePrompt && (
                <SuccessAlert onAddAnother={scrollToValueForm} />
              )}
            </>
          )}
          
          <div className="flex justify-end">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSave}
              disabled={
                !description.trim() || 
                !code.trim() || 
                (!mealIncluded.breakfast && !mealIncluded.lunch && !mealIncluded.dinner) ||
                (values.length === 0 && !currentValue)
              }
            >
              Save Mealplan
            </Button>
          </div>
          
          {savedSupplements.length === 0 && <EmptyMealplanState />}
        </div>
      )}
    </div>
  );
};

export default MealplanSupplements;
