"use client";

import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CopyrightIcon, ListIcon, SearchIcon, TableIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Conference, ConferenceType } from "../../types/api";
import ConferenceCardListView from "./ConferenceCardListView";
import ConferenceTableView from "./ConferenceTableView";
import { FilterBadgeGroup } from "../FilterBadgeGroup";
import PaginationControls from "../PaginationControls";

const CCF_TAGS = ["A", "B", "C"];
const DEBOUNCE_DELAY = 300; // 300ms delay

export default function Conferences() {
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
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode as "list" | "table");
    }

    const savedPageIndex = localStorage.getItem("pageIndex");
    if (savedPageIndex) {
      setPageIndex(JSON.parse(savedPageIndex));
    }

    const savedPageSize = localStorage.getItem("pageSize");
    if (savedPageSize) {
      setPageSize(JSON.parse(savedPageSize));
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

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("pageIndex", JSON.stringify(pageIndex));
  }, [pageIndex]);

  useEffect(() => {
    localStorage.setItem("pageSize", JSON.stringify(pageSize));
  }, [pageSize]);

  // Override viewMode to always be "list" on mobile devices
  useEffect(() => {
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6 space-y-4 w-full">
        {/* Mobile-optimized header controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Top row: Controls and search */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex gap-2">
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
              {!isMobile && (
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode((value || viewMode) as "list" | "table")
                  }
                  variant="outline"
                >
                  <ToggleGroupItem value="list">
                    <ListIcon className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table">
                    <TableIcon className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>
            <div className="relative flex-1" style={{ minWidth: "200px" }}>
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conferences..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {/* Date picker on its own row on mobile */}
          <div className="w-full sm:w-auto">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>
        {/* Mobile-optimized filter sections */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
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
          <FilterBadgeGroup
            items={CCF_TAGS.map((tag) => ({
              id: tag,
              label: `CCF-${tag}`,
            }))}
            selectedItems={selectedCCFs}
            onToggle={toggleSelectedCCF}
            onClear={() => setSelectedCCFs([])}
          />
        </div>
      </div>

      {viewMode === "list" ? (
        <ConferenceCardListView
          conferences={conferences}
          loading={loading}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
        />
      ) : (
        <ConferenceTableView
          conferences={conferences}
          loading={loading}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
        />
      )}

      <PaginationControls
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPages={totalPages}
        pageInputValue={pageInputValue}
        onPageChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
        onPageInputChange={setPageInputValue}
        onPageInputSubmit={(value) => {
          const pageValue = parseInt(value);
          if (pageValue >= 1 && pageValue <= totalPages) {
            setPageIndex(pageValue - 1);
          }
        }}
      />
    </div>
  );
}
