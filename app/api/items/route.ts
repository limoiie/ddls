import { NextRequest, NextResponse } from "next/server";
import { readAllYamlFiles } from "@/app/lib/yaml";
import { Conference, ConferenceEvent } from "@/app/types/api";

function getLatestDateOfConferenceEvent(conf: ConferenceEvent) {
  return new Date(
    conf.timeline[0].deadline || conf.timeline[0].abstract_deadline || ""
  );
}

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

  // Filter items based on keyword, CCF, and date range if provided and sort by the latest conference date
  const sortedFilteredItems: Conference[] = items
    .filter((item) => {
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
        !ccf ||
        (ccf.split(",").includes(item.rank.ccf) && item.rank.ccf !== "") ||
        (ccf.split(",").includes("N") && !item.rank.ccf);

      const matchesDateRange =
        !startDate ||
        !endDate ||
        item.confs.some((conf) => {
          const deadlineDate = getLatestDateOfConferenceEvent(conf);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return deadlineDate >= start && deadlineDate <= end;
        });

      return matchesKeyword && matchesCCF && matchesDateRange;
    })
    .map((item) => {
      return {
        ...item,
        confs: item.confs
          // filter out conference events that have already passed
          .filter((conf) => {
            const dateA = getLatestDateOfConferenceEvent(conf);
            return dateA.getTime() > Date.now();
          })
          // sort by the latest conference event date
          .sort((a, b) => {
            const dateA = getLatestDateOfConferenceEvent(a);
            const dateB = getLatestDateOfConferenceEvent(b);
            return dateB.getTime() - dateA.getTime();
          }),
      };
    })
    // filter out items that have no conference events
    .filter((item) => item.confs.length > 0)
    // sort by the latest conference date
    .sort((a, b) => {
      const dateA = getLatestDateOfConferenceEvent(a.confs[0]);
      const dateB = getLatestDateOfConferenceEvent(b.confs[0]);
      return dateA.getTime() - dateB.getTime();
    });

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
