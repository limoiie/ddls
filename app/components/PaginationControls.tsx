"use client";

import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  pageInputValue: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onPageInputChange: (value: string) => void;
  onPageInputSubmit: (value: string) => void;
}

export default function PaginationControls({
  pageIndex,
  pageSize,
  totalPages,
  pageInputValue,
  onPageChange,
  onPageSizeChange,
  onPageInputChange,
  onPageInputSubmit,
}: PaginationControlsProps) {
  const shownPageHalfWinSize = 2;

  return (
    <Pagination className="mt-8 flex justify-center gap-2">
      <PaginationContent>
        {/* Page size selector */}
        <PaginationItem>
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm">Page size</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => {
                const newSize = parseInt(value);
                onPageSizeChange(newSize);
                onPageChange(0); // Reset to first page when changing page size
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PaginationItem>

        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          />
        </PaginationItem>

        {/* First page */}
        <PaginationItem>
          <PaginationLink
            onClick={() => onPageChange(0)}
            isActive={pageIndex === 0}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {/* Left ellipsis */}
        {pageIndex > 1 + shownPageHalfWinSize && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Pages around current page */}
        {Array.from({ length: totalPages }).map((_, i) => {
          if (i === 0 || i === totalPages - 1) return null; // Skip first and last
          if (Math.abs(i - pageIndex) > shownPageHalfWinSize) return null; // Show only pages around current
          return (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={pageIndex === i}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Right ellipsis */}
        {pageIndex < totalPages - 2 - shownPageHalfWinSize && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last page */}
        {totalPages > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(totalPages - 1)}
              isActive={pageIndex === totalPages - 1}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages - 1, pageIndex + 1))}
          />
        </PaginationItem>

        {/* Page input */}
        <PaginationItem>
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm">Go to</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={pageInputValue}
              onChange={(e) => onPageInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onPageInputSubmit(pageInputValue);
                }
              }}
              className="w-16 h-8"
            />
          </div>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
