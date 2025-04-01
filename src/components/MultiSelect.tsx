
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No options found.",
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: Option) => {
    const selectedIndex = selected.findIndex(
      (item) => item.id === option.id
    );
    
    let updatedSelected: Option[];
    
    if (selectedIndex === -1) {
      updatedSelected = [...selected, option];
    } else {
      updatedSelected = selected.filter((_, index) => index !== selectedIndex);
    }
    
    onChange(updatedSelected);
  };

  const handleRemove = (option: Option) => {
    onChange(selected.filter((item) => item.id !== option.id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0
            ? `${selected.length} selected`
            : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}`} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {options.map((option) => {
              const isSelected = selected.some(
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
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((option) => (
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
