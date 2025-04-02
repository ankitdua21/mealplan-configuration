
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info, Check, Plus } from "lucide-react";
import { Conflict, Supplement, SupplementValue } from "@/models/SupplementTypes";
import { roomTypes, ratePlans, supplementTypes } from "@/data/dummyData";
import ValueForm from "./ValueForm";
import ValueList from "./ValueList";
import ConflictResolver from "./ConflictResolver";
import SavedSupplement from "./SavedSupplement";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MealplanSupplements = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
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
    
    toast({
      title: "Value added",
      description: "You can add more values or save your mealplan.",
    });
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
      values: valuesToSave,
    };
    
    setSavedSupplements(prev => [...prev, supplement]);
    toast({
      title: "Success",
      description: "Mealplan supplement has been saved successfully.",
    });
    
    setDescription("");
    setValues([]);
    setCurrentValue(null);
    setConflicts([]);
    setShowConflictResolver(false);
    setShowAddMorePrompt(false);
  };

  const handleResolveConflicts = (resolvedValues: SupplementValue[]) => {
    saveWithoutConflicts(resolvedValues);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Hotel Supplements Configuration</h1>
      
      {savedSupplements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Saved Mealplans</h2>
            <Button 
              variant="outline" 
              onClick={() => setSavedSupplements([])}
              className="text-sm"
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-4">
            {savedSupplements.map(supplement => (
              <SavedSupplement key={supplement.id} supplement={supplement} />
            ))}
          </div>
        </div>
      )}
      
      {showConflictResolver ? (
        <ConflictResolver
          conflicts={conflicts}
          values={currentValue ? [...values, currentValue] : values}
          onResolve={handleResolveConflicts}
          onCancel={() => setShowConflictResolver(false)}
        />
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Configure New Supplement</CardTitle>
                {savedSupplements.length > 0 && (
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
                <div>
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
              </div>
            </CardContent>
          </Card>
          
          <ValueForm
            roomTypes={roomTypes}
            ratePlans={ratePlans}
            onAdd={handleAddValue}
          />
          
          {values.length > 0 && (
            <>
              <ValueList values={values} onRemove={handleRemoveValue} />
              
              {showAddMorePrompt && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 flex justify-between items-center">
                    <span>Value added successfully! You can add more values or save your mealplan.</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-4 border-green-300 text-green-700"
                      onClick={() => {
                        document.getElementById('valueForm')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Another Value
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          <div className="flex justify-end">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSave}
              disabled={!description || (values.length === 0 && !currentValue)}
            >
              Save Mealplan
            </Button>
          </div>
          
          {savedSupplements.length === 0 && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default MealplanSupplements;
