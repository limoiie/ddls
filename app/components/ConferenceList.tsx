"use client";

import { useState, useEffect, useCallback } from "react";
import { Conference, ConferenceType } from "../types/api";
import ConferenceConf from "./ConferenceConf";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CopyrightIcon, StarIcon } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterBadgeGroup } from "./FilterBadgeGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CCF_TAGS = ["A", "B", "C", "N"];
const DEBOUNCE_DELAY = 300; // 300ms delay

export default function ConferenceList() {
  const shownPageHalfWinSize = 2;
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [types, setTypes] = useState<ConferenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [customTypeMode, setCustomTypeMode] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCCFs, setSelectedCCFs] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pageInputValue, setPageInputValue] = useState("1");

  // Initialize state from localStorage on client-side
  useEffect(() => {
    const savedCustomTypeMode = localStorage.getItem("customTypeMode");
    if (savedCustomTypeMode) {
      setCustomTypeMode(JSON.parse(savedCustomTypeMode));
    }

    const savedSelectedTypes = localStorage.getItem("selectedTypes");
    if (savedSelectedTypes) {
      setSelectedTypes(JSON.parse(savedSelectedTypes));
    }

    const savedSelectedCCFs = localStorage.getItem("selectedCCFs");
    if (savedSelectedCCFs) {
      setSelectedCCFs(JSON.parse(savedSelectedCCFs));
    }

    const savedDateRange = localStorage.getItem("dateRange");
    if (savedDateRange) {
      setDateRange(JSON.parse(savedDateRange));
    }

    const savedPinnedIds = localStorage.getItem("pinnedConferences");
    if (savedPinnedIds) {
      setPinnedIds(JSON.parse(savedPinnedIds));
    }
  }, []);

  // Save filter options to localStorage when they change
  useEffect(() => {
    localStorage.setItem("customTypeMode", JSON.stringify(customTypeMode));
  }, [customTypeMode]);

  useEffect(() => {
    localStorage.setItem("selectedTypes", JSON.stringify(selectedTypes));
  }, [selectedTypes]);

  useEffect(() => {
    localStorage.setItem("selectedCCFs", JSON.stringify(selectedCCFs));
  }, [selectedCCFs]);

  useEffect(() => {
    if (dateRange) {
      localStorage.setItem("dateRange", JSON.stringify(dateRange));
    } else {
      localStorage.removeItem("dateRange");
    }
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem("pinnedConferences", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  // Reset page index when filters change
  useEffect(() => {
    setPageIndex(0);
    setPageInputValue("1");
  }, [
    selectedCCFs,
    selectedTypes,
    pinnedIds,
    debouncedKeyword,
    dateRange,
    customTypeMode,
  ]);

  // Add debounce effect for keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Load conference types
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const params = new URLSearchParams({
          customTypeMode: customTypeMode.toString(),
        });
        const response = await fetch(`/api/types?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to load conference types");
        }
        const data = await response.json();
        setTypes(data);
      } catch (error) {
        console.error("Error loading conference types:", error);
      }
    };
    loadTypes();
  }, [customTypeMode]);

  const togglePin = useCallback((title: string) => {
    setPinnedIds((prev) => {
      const newPinnedIds = prev.includes(title)
        ? prev.filter((id) => id !== title)
        : [...prev, title];
      localStorage.setItem("pinnedConferences", JSON.stringify(newPinnedIds));
      return newPinnedIds;
    });
  }, []);

  const toggleSelectedCCF = useCallback((tag: string) => {
    setSelectedCCFs((prev) => {
      const newSelectedCCFs = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      return newSelectedCCFs;
    });
  }, []);

  const toggleSelectedType = useCallback((type: string) => {
    setSelectedTypes((prev) => {
      const newSelectedTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      return newSelectedTypes;
    });
  }, []);

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        keyword: debouncedKeyword,
        ccf: selectedCCFs.join(","),
        types: selectedTypes.join(","),
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        pinnedIds: pinnedIds.join(","),
        customTypeMode: customTypeMode.toString(),
      });

      if (dateRange?.from) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange?.to) {
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
      }

      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conferences");
      }
      const data = await response.json();
      setConferences(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching conferences:", error);
      setError("Failed to load conferences. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedKeyword,
    selectedCCFs,
    selectedTypes,
    pageIndex,
    pageSize,
    pinnedIds,
    dateRange,
    customTypeMode,
  ]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  id="custom-type-mode"
                  variant="outline"
                  onClick={() => setCustomTypeMode(!customTypeMode)}
                  className={`${
                    customTypeMode ? "bg-blue-100 border-blue-200" : ""
                  }`}
                >
                  <CopyrightIcon
                    className={`size-4 ${
                      customTypeMode ? "text-blue-500" : ""
                    }`}
                  />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {customTypeMode
                  ? "Show full CCF conferences"
                  : "Show custom CCF conferences"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            type="text"
            placeholder="Search conferences..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
            style={{ minWidth: "200px" }}
          />
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
        <FilterBadgeGroup
          items={CCF_TAGS.map((tag) => ({
            id: tag,
            label: `CCF-${tag}`,
          }))}
          selectedItems={selectedCCFs}
          onToggle={toggleSelectedCCF}
          onClear={() => setSelectedCCFs([])}
        />
        <FilterBadgeGroup
          items={types.map((type) => ({
            id: type.sub,
            label: type.sub,
            tooltip: `${type.name} (${type.name_en})`,
          }))}
          selectedItems={selectedTypes}
          onToggle={toggleSelectedType}
          onClear={() => setSelectedTypes([])}
          showTooltip={true}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          conferences.map((conference) => (
            <div
              key={conference.title.toUpperCase()}
              className="group flex flex-col gap-4 p-6 rounded-lg shadow-md relative bg-gray-50 dark:bg-gray-800"
            >
              <button
                onClick={() => togglePin(conference.title)}
                className={`absolute top-0 left-0 p-2 rounded-full transition-colors z-10 pointer-events-auto rotate-320 ${
                  pinnedIds.includes(conference.title)
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-gray-500 opacity-100 sm:opacity-0 group-hover:opacity-100"
                }`}
                title={pinnedIds.includes(conference.title) ? "Unpin" : "Pin"}
              >
                <StarIcon
                  className={`w-5 h-5 ${
                    pinnedIds.includes(conference.title) ? "fill-current" : ""
                  }`}
                />
              </button>
              <div className="space-y-4">
                <ConferenceConf
                  key={conference.confs[0].id}
                  conf={conference.confs[0]}
                  confSeries={conference}
                />
                {conference.confs.length > 1 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem key="other-confs" value="other-confs">
                      <AccordionTrigger className="py-0">
                        History Conferences
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3 pt-6">
                        {conference.confs.slice(1).map((conf) => (
                          <div key={conf.id} className="flex flex-col gap-3">
                            <Separator />
                            <ConferenceConf
                              conf={conf}
                              confSeries={conference}
                            />
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{conference.sub}</Badge>
                {conference.rank.ccf && (
                  <Badge variant="outline">CCF: {conference.rank.ccf}</Badge>
                )}
                {conference.rank.core && (
                  <Badge variant="outline">CORE: {conference.rank.core}</Badge>
                )}
                {conference.rank.thcpl && (
                  <Badge variant="outline">
                    THCPL: {conference.rank.thcpl}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
                  setPageSize(newSize);
                  setPageIndex(0); // Reset to first page when changing page size
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

          {/* <PaginationItem>
            <PaginationLink onClick={() => setPageIndex(0)}>
              <ChevronsLeftIcon className="size-4" />
            </PaginationLink>
          </PaginationItem> */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            />
          </PaginationItem>

          {/* First page */}
          <PaginationItem>
            <PaginationLink
              onClick={() => setPageIndex(0)}
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
                  onClick={() => setPageIndex(i)}
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
                onClick={() => setPageIndex(totalPages - 1)}
                isActive={pageIndex === totalPages - 1}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages - 1, p + 1))
              }
            />
          </PaginationItem>
          {/* <PaginationItem>
            <PaginationLink onClick={() => setPageIndex(totalPages - 1)}>
              <ChevronsRightIcon className="size-4" />
            </PaginationLink>
          </PaginationItem> */}

          {/* Page input */}
          <PaginationItem>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm">Go to</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInputValue}
                onChange={(e) => {
                  setPageInputValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = parseInt(pageInputValue);
                    if (value >= 1 && value <= totalPages) {
                      setPageIndex(value - 1);
                    }
                  }
                }}
                className="w-16 h-8"
              />
            </div>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
