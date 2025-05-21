import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrushCleaningIcon } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterBadgeGroupProps {
  items: Array<{
    id: string;
    label: string;
    tooltip?: string;
  }>;
  selectedItems: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  showTooltip?: boolean;
}

export function FilterBadgeGroup({
  items,
  selectedItems,
  onToggle,
  onClear,
  showTooltip = false,
}: FilterBadgeGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item.id}
          variant={`${selectedItems.includes(item.id) ? "default" : "outline"}`}
          onClick={() => onToggle(item.id)}
          className={`px-3 py-1 rounded-lg border ${
            selectedItems.includes(item.id)
              ? "bg-blue-500 text-white border-blue-500"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {showTooltip && item.tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{item.label}</span>
                </TooltipTrigger>
                <TooltipContent>{item.tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            item.label
          )}
        </Badge>
      ))}
      <Button
        variant="ghost"
        onClick={onClear}
        className={`${selectedItems.length > 0 ? "visible" : "invisible"}`}
      >
        <BrushCleaningIcon className="size-4" />
      </Button>
    </div>
  );
} 