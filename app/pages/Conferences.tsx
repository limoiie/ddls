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
import {
  CopyrightIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  TableIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Conference, ConferenceType } from "../types/api";
import { Button } from "@/components/ui/button";
import ConferenceCardListView from "@/app/components/conferences/ConferenceCardListView";
import ConferenceTableView from "@/app/components/conferences/ConferenceTableView";
import { FilterBadgeGroup } from "@/app/components/FilterBadgeGroup";
import PaginationControls from "@/app/components/PaginationControls";
import SettingsDialog from "@/app/components/SettingsDialog";
import { useSettings } from "@/app/lib/settings";

const CCF_TAGS = ["A", "B", "C"];
const DEBOUNCE_DELAY = 300; // 300ms delay

export default function Conferences() {
  const {
    settings,
    isLoaded,
    updateSetting,
    togglePin,
    toggleSelectedCCF,
    toggleSelectedType,
    clearSelectedTypes,
    clearSelectedCCFs,
    resetPageIndex,
  } = useSettings();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [types, setTypes] = useState<ConferenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [pageInputValue, setPageInputValue] = useState("1");
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Wait for settings to load before initializing
  useEffect(() => {
    if (isLoaded) {
      setPageInputValue((settings.pageIndex + 1).toString());
    }
  }, [isLoaded, settings.pageIndex]);

  // Override viewMode to always be "list" on mobile devices
  useEffect(() => {
    if (isMobile) {
      updateSetting("viewMode", "list");
    }
  }, [isMobile, updateSetting]);

  // Reset page index when filters change
  useEffect(() => {
    if (isLoaded) {
      resetPageIndex();
      setPageInputValue("1");
    }
  }, [
    settings.selectedCCFs,
    settings.selectedTypes,
    settings.pinnedConferences,
    debouncedKeyword,
    settings.dateRange,
    settings.labPreferedMode,
    isLoaded,
    resetPageIndex,
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
    if (!isLoaded) return;

    const loadTypes = async () => {
      try {
        const params = new URLSearchParams({
          labPreferedMode: settings.labPreferedMode.toString(),
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
  }, [settings.labPreferedMode, isLoaded]);

  const fetchConferences = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        keyword: debouncedKeyword,
        ccf: settings.selectedCCFs.join(","),
        types: settings.selectedTypes.join(","),
        pageIndex: settings.pageIndex.toString(),
        pageSize: settings.pageSize.toString(),
        pinnedIds: settings.pinnedConferences.join(","),
        labPreferedMode: settings.labPreferedMode.toString(),
      });

      if (settings.dateRange?.from) {
        params.append(
          "startDate",
          format(settings.dateRange.from, "yyyy-MM-dd")
        );
      }
      if (settings.dateRange?.to) {
        params.append("endDate", format(settings.dateRange.to, "yyyy-MM-dd"));
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
    settings.selectedCCFs,
    settings.selectedTypes,
    settings.pageIndex,
    settings.pageSize,
    settings.pinnedConferences,
    settings.dateRange,
    settings.labPreferedMode,
    isLoaded,
  ]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  if (!isLoaded) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6 space-y-4 w-full">
        {/* Mobile-optimized header controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Top row: Controls and search */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex gap-2">
              {/* Mode toggle button for switching between custom and full CCF conferences */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      id="custom-type-mode"
                      variant="outline"
                      onClick={() =>
                        updateSetting(
                          "labPreferedMode",
                          !settings.labPreferedMode
                        )
                      }
                      className={`${
                        settings.labPreferedMode
                          ? "bg-blue-100 border-blue-200"
                          : ""
                      }`}
                    >
                      <CopyrightIcon
                        className={`size-4 ${
                          settings.labPreferedMode ? "text-blue-500" : ""
                        }`}
                      />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    {settings.labPreferedMode
                      ? "Show full CCF conferences"
                      : "Show custom CCF conferences"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* View mode toggle button for switching between list and table view */}
              {!isMobile && (
                <ToggleGroup
                  type="single"
                  value={settings.viewMode}
                  onValueChange={(value) =>
                    updateSetting(
                      "viewMode",
                      (value || settings.viewMode) as "list" | "table"
                    )
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
            {/* Search box */}
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
            <DatePickerWithRange
              date={settings.dateRange}
              onDateChange={(dateRange) =>
                updateSetting("dateRange", dateRange)
              }
            />
          </div>
          {/* Settings button for opening the settings dialog  */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon className="size-4" />
          </Button>
        </div>
        {/* Mobile-optimized filter sections */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
          <FilterBadgeGroup
            items={types.map((type) => ({
              id: type.sub,
              label: type.sub,
              tooltip: `${type.name} (${type.name_en})`,
            }))}
            selectedItems={settings.selectedTypes}
            onToggle={toggleSelectedType}
            onClear={clearSelectedTypes}
            showTooltip={true}
          />
          <FilterBadgeGroup
            items={CCF_TAGS.map((tag) => ({
              id: tag,
              label: `CCF-${tag}`,
            }))}
            selectedItems={settings.selectedCCFs}
            onToggle={toggleSelectedCCF}
            onClear={clearSelectedCCFs}
          />
        </div>
      </div>

      {settings.viewMode === "list" ? (
        <ConferenceCardListView
          conferences={conferences}
          loading={loading}
          pinnedIds={settings.pinnedConferences}
          onTogglePin={togglePin}
        />
      ) : (
        <ConferenceTableView
          conferences={conferences}
          loading={loading}
          pinnedIds={settings.pinnedConferences}
          onTogglePin={togglePin}
        />
      )}

      <PaginationControls
        pageIndex={settings.pageIndex}
        pageSize={settings.pageSize}
        totalPages={totalPages}
        pageInputValue={pageInputValue}
        onPageChange={(pageIndex) => updateSetting("pageIndex", pageIndex)}
        onPageSizeChange={(size) => {
          updateSetting("pageSize", size);
          updateSetting("pageIndex", 0);
        }}
        onPageInputChange={setPageInputValue}
        onPageInputSubmit={(value) => {
          const pageValue = parseInt(value);
          if (pageValue >= 1 && pageValue <= totalPages) {
            updateSetting("pageIndex", pageValue - 1);
          }
        }}
      />

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
