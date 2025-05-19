import { NextRequest, NextResponse } from "next/server";
import { readAllYamlFiles } from "@/app/lib/yaml";
import { Conference } from "@/app/types/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword")?.toLowerCase() || "";
  const ccf = searchParams.get("ccf") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const pinnedIds = searchParams.get("pinnedIds")?.split(",") || [];
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  // Read conferences from YAML files
  const items: Conference[] = await readAllYamlFiles();

  // Filter items based on keyword, CCF, and date range if provided
  const filteredItems: Conference[] = items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.sub.toLowerCase().includes(keyword) ||
      item.confs.some(
        (conf) =>
          conf.place.toLowerCase().includes(keyword) ||
          conf.id.toLowerCase().includes(keyword)
      );

    const matchesCCF =
      !ccf || item.rank.ccf === ccf || (ccf === "N" && !item.rank.ccf);

    const matchesDateRange = !startDate || !endDate || item.confs.some((conf) => {
      const deadlineDate = new Date(
        conf.timeline[0].deadline || conf.timeline[0].abstract_deadline || ""
      );
      const start = new Date(startDate);
      const end = new Date(endDate);
      return deadlineDate >= start && deadlineDate <= end;
    });

    return matchesKeyword && matchesCCF && matchesDateRange;
  });

  const sortedFilteredItems = filteredItems
    // sort by the latest conference date
    .sort((a, b) => {
      const dateA = new Date(a.confs[0].date);
      const dateB = new Date(b.confs[0].date);
      return dateA.getTime() - dateB.getTime();
    })
    .map((item) => {
      return {
        ...item,
        confs: item.confs
          // filter out conferences that have already passed
          .filter((conf) => {
            const dateA = new Date(
              conf.timeline[0].deadline ||
                conf.timeline[0].abstract_deadline ||
                ""
            );
            return dateA.getTime() > Date.now();
          })
          .sort((a, b) => {
            const dateA = new Date(
              a.timeline[0].deadline || a.timeline[0].abstract_deadline || ""
            );
            const dateB = new Date(
              b.timeline[0].deadline || b.timeline[0].abstract_deadline || ""
            );
            return dateB.getTime() - dateA.getTime();
          }),
      };
    })
    // filter out items that have no conferences
    .filter((item) => item.confs.length > 0);

  // Separate pinned and unpinned items
  const pinnedItems = sortedFilteredItems.filter((item) =>
    pinnedIds.includes(item.title)
  );
  const unpinnedItems = sortedFilteredItems.filter(
    (item) => !pinnedIds.includes(item.title)
  );

  // Combine pinned and unpinned items
  const combinedItems = [...pinnedItems, ...unpinnedItems];

  // Calculate pagination
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = combinedItems.slice(startIndex, endIndex);

  return NextResponse.json({
    items: paginatedItems,
    total: combinedItems.length,
    pageIndex,
    pageSize,
    totalPages: Math.ceil(combinedItems.length / pageSize),
  });
}
