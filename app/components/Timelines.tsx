"use client";
import { Timeline } from "@/app/types/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { isTimelinePassed } from "../lib/date";
import TimelineCard from "./TimelineCard";

interface TimelinesProps {
  editionPassed: boolean;
  timelines: Timeline[];
  timezone: string;
  confId: string;
}

export default function Timelines({
  editionPassed,
  timelines,
  timezone,
  confId,
}: TimelinesProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const firstUpcomingIndex = useMemo(() => {
    return timelines.findIndex((tl) => !isTimelinePassed(tl, timezone));
  }, [timelines, timezone]);

  const currentIndex = api
    ? selectedIndex
    : firstUpcomingIndex === -1
    ? timelines.length - 1
    : firstUpcomingIndex;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const onSaveNotification = async (datetime: string) => {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        confEditionId: confId,
        notification: datetime || null,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save notification time");
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-row gap-4 items-stretch">
      <Carousel
        orientation="vertical"
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: false,
          startIndex:
            firstUpcomingIndex === -1
              ? timelines.length - 1
              : firstUpcomingIndex,
        }}
      >
        <CarouselContent className="h-full" viewportClassName="h-[100px]">
          {timelines.map((timeline: Timeline, idx: number) => {
            const defaultComment =
              timelines.length === 1 ? "Single round" : `Round ${idx + 1}`;

            return (
              <CarouselItem key={idx} className="h-full">
                <div className="w-full h-full flex flex-col gap-4 items-end">
                  <TimelineCard
                    editionPassed={editionPassed}
                    timeline={timeline}
                    timezone={timezone}
                    defaultComment={defaultComment}
                    onSaveNotification={onSaveNotification}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      {/* Navigation buttons */}
      <div className="flex flex-col items-center gap-3 py-2">
        {timelines.map((timeline: Timeline, idx: number) => {
          const defaultComment =
            timelines.length === 1 ? "Single round" : `Round ${idx + 1}`;
          const label = timeline.comment?.trim() || defaultComment;
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <button
                  aria-label={`Go to ${
                    timelines.length === 1 ? "single" : `round ${idx + 1}`
                  } timeline`}
                  aria-current={currentIndex === idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                    currentIndex === idx
                      ? idx === firstUpcomingIndex
                        ? "bg-blue-600 border-blue-600 shadow-[0_0_0_2px] shadow-blue-600/30 dark:shadow-blue-500/30"
                        : "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100 shadow-[0_0_0_2px] shadow-gray-900/20 dark:shadow-gray-100/20"
                      : "bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-300/40 dark:hover:bg-gray-600/40"
                  }`}
                />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
