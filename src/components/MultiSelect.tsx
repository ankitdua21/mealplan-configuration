
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  items?: Option[];
  options?: Option[];
  selected?: Option[];
  selectedItems?: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

const MultiSelect = ({
  items = [],
  options = [],
  selected = [],
  selectedItems = [],
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No options found.",
  className,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  
  // Use either items or options prop (for backwards compatibility)
  const itemsToUse = items.length > 0 ? items : options;
  // Use either selected or selectedItems prop (for backwards compatibility)
  const selectedToUse = selected.length > 0 ? selected : selectedItems;

  const handleSelect = (option: Option) => {
    const selectedIndex = selectedToUse.findIndex(
      (item) => item.id === option.id
    );
    
    let updatedSelected: Option[];
    
    if (selectedIndex === -1) {
      updatedSelected = [...selectedToUse, option];
    } else {
      updatedSelected = selectedToUse.filter((_, index) => index !== selectedIndex);
    }
    
    onChange(updatedSelected);
  };

  const handleRemove = (option: Option) => {
    onChange(selectedToUse.filter((item) => item.id !== option.id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedToUse.length > 0
            ? `${selectedToUse.length} selected`
            : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {itemsToUse && itemsToUse.length > 0 ? itemsToUse.map((option) => {
                const isSelected = selectedToUse.some(
                  (item) => item.id === option.id
                );
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                );
              }) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      
      {selectedToUse.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedToUse.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-2"
            >
              {option.name}
              <button
                type="button"
                onClick={() => handleRemove(option)}
                className="ml-1 rounded-full text-gray-500 hover:bg-gray-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Popover>
  );
};

export default MultiSelect;
