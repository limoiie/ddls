import { NextRequest, NextResponse } from "next/server";
import {
  readAllConferenceYamlFiles,
  readCustomTypesYamlFile,
} from "@/app/lib/yaml";
import { Conference, ConferenceEvent } from "@/app/types/api";
import { isPast } from "date-fns";
import { getIANATimezone } from "@/app/lib/date";
import moment from "moment-timezone";

function getLatestDateOfConferenceEvent(conf: ConferenceEvent): Date {
  const ianaTimezone = getIANATimezone(conf.timezone);
  const latestTimeline = conf.timeline[0];
  if (
    (!latestTimeline.deadline || latestTimeline.deadline === "TBD") &&
    (!latestTimeline.abstract_deadline ||
      latestTimeline.abstract_deadline === "TBD")
  ) {
    // If the deadline and abstract deadline are both TBD, return a date far in the future
    return new Date("9999-12-31");
  }

  return moment
    .tz(
      latestTimeline.deadline || latestTimeline.abstract_deadline || "",
      ianaTimezone
    )
    .toDate();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword")?.toLowerCase() || "";
  const ccf =
    searchParams
      .get("ccf")
      ?.split(",")
      .filter((c) => c !== "") || [];
  const types =
    searchParams
      .get("types")
      ?.split(",")
      .filter((t) => t !== "") || [];
  const customTypeMode = searchParams.get("customTypeMode") === "true";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const pinnedIds = searchParams.get("pinnedIds")?.split(",") || [];
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  // Read conferences from YAML files
  const items: Conference[] = await readAllConferenceYamlFiles();

  // Read custom types from YAML file, which maps conf title to its custom types
  const customTypes: Record<string, string> = (
    await readCustomTypesYamlFile()
  ).reduce((acc, it) => {
    it.confs.forEach((conf) => {
      acc[conf] = !acc[conf] ? it.sub : "," + it.sub;
    });
    return acc;
  }, {} as Record<string, string>);

  // Filter items based on keyword, CCF, and date range if provided and sort by the latest conference date
  const sortedFilteredItems: Conference[] = items
    // Overwrite types if customTypeMode is enabled
    .map((item) => {
      return customTypeMode
        ? {
            ...item,
            sub: customTypes[item.title] || "",
          }
        : item;
    })
    .filter((item) => item.sub !== "")
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

      const matchesTypes =
        types.length === 0 ||
        item.sub.split(",").some((sub) => types.includes(sub));

      const matchesCCF =
        ccf.length === 0 ||
        ccf.includes(item.rank.ccf) ||
        (ccf.includes("N") && !item.rank.ccf);

      const matchesDateRange =
        !startDate ||
        !endDate ||
        item.confs.some((conf) => {
          const deadlineDate = getLatestDateOfConferenceEvent(conf);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return deadlineDate >= start && deadlineDate <= end;
        });

      return matchesKeyword && matchesTypes && matchesCCF && matchesDateRange;
    })
    .map((item) => {
      return {
        ...item,
        confs: item.confs
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
      if (isPast(dateA) !== isPast(dateB)) {
        return isPast(dateA) ? 1 : -1;
      }

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
