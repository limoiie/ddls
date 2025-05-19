"use client";

import { useState, useEffect, useCallback } from "react";
import { Conference } from "../types/api";
import ConferenceConf from "./ConferenceConf";

export default function ConferenceList() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        ...(keyword && { keyword }),
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
  }, [pageIndex, pageSize, keyword]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search conferences..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-6">
        {conferences.map((conference) => (
          <div
            key={conference.title.toUpperCase()}
            className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="flex flex-row gap-4 items-end">
              <div className="flex-1 flex flex-row gap-4 items-end">
                <h2 className="text-2xl font-bold">{conference.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {conference.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs">
                  {conference.sub}
                </span>
                {conference.rank.ccf && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-xs">
                    CCF: {conference.rank.ccf}
                  </span>
                )}
                {conference.rank.core && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full text-xs">
                    CORE: {conference.rank.core}
                  </span>
                )}
                {conference.rank.thcpl && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full text-xs">
                    THCPL: {conference.rank.thcpl}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {conference.confs.map((conf) => (
                <ConferenceConf key={conf.id} conf={conf} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
          disabled={pageIndex === 0}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
          disabled={pageIndex === totalPages - 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
