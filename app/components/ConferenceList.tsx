"use client";

import { useState, useEffect, useCallback } from "react";
import { Conference } from "../types/api";
import ConferenceConf from "./ConferenceConf";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  BrushCleaningIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  StarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const CCF_TAGS = ["A", "B", "C", "N"];
const DEBOUNCE_DELAY = 300; // 300ms delay

export default function ConferenceList() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCCFs, setSelectedCCFs] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedConferences");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Add debounce effect for keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [keyword]);

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

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        ...(debouncedKeyword && { keyword: debouncedKeyword }),
        ...(selectedCCFs.length > 0 && { ccf: selectedCCFs.join(",") }),
        ...(dateRange?.from && {
          startDate: format(dateRange.from, "yyyy-MM-dd"),
        }),
        ...(dateRange?.to && { endDate: format(dateRange.to, "yyyy-MM-dd") }),
        ...(pinnedIds.length > 0 && { pinnedIds: pinnedIds.join(",") }),
      });

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch conferences");

      const data = await response.json();
      setConferences(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    pageIndex,
    pageSize,
    debouncedKeyword,
    selectedCCFs,
    dateRange,
    pinnedIds,
  ]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search conferences..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
        <div className="flex gap-2">
          {CCF_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={`${selectedCCFs.includes(tag) ? "default" : "outline"}`}
              onClick={() => toggleSelectedCCF(tag)}
              className={`px-3 py-1 rounded-lg border ${
                selectedCCFs.includes(tag)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              CCF-{tag}
            </Badge>
          ))}
          <Button
            variant="ghost"
            onClick={() => setSelectedCCFs([])}
            className={`${selectedCCFs.length > 0 ? "visible" : "invisible"}`}
          >
            <BrushCleaningIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          conferences.map((conference) => (
            <div
              key={conference.title.toUpperCase()}
              className="group flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md relative"
            >
              <button
                onClick={() => togglePin(conference.title)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  pinnedIds.includes(conference.title)
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-gray-500 opacity-0 group-hover:opacity-100"
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
                {conference.confs.map((conf) => (
                  <ConferenceConf
                    key={conf.id}
                    conf={conf}
                    confSeries={conference}
                  />
                ))}
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
          <PaginationItem>
            <PaginationLink onClick={() => setPageIndex(0)}>
              <ChevronsLeftIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setPageIndex(i)}
                isActive={pageIndex === i}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages - 1, p + 1))
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink onClick={() => setPageIndex(totalPages - 1)}>
              <ChevronsRightIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
