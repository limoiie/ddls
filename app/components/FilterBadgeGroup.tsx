import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrushCleaningIcon } from "lucide-react";

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
          className={`h-8 sm:h-9 px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm cursor-pointer touch-manipulation ${
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
      {selectedItems.length > 0 && (
        <Button variant="ghost" onClick={onClear} className="h-8 sm:h-9 px-2 sm:px-3">
          <BrushCleaningIcon className="size-3 sm:size-4" />
        </Button>
      )}
    </div>
  );
}
