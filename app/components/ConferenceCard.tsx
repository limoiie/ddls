"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarIcon } from "lucide-react";
import { Conference } from "../types/api";
import ConferenceEdition from "./ConferenceEdition";

interface ConferenceCardProps {
  conference: Conference;
  pinnedIds: string[];
  onTogglePin: (title: string) => void;
}

export default function ConferenceCard({
  conference,
  pinnedIds,
  onTogglePin,
}: ConferenceCardProps) {
  return (
    <div
      key={conference.title.toUpperCase()}
      className="group flex flex-col gap-4 p-6 rounded-lg shadow-md relative bg-gray-50 dark:bg-gray-800"
    >
      <button
        onClick={() => onTogglePin(conference.title)}
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
      <div className="space-y-2">
        <ConferenceEdition
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
                    <ConferenceEdition conf={conf} confSeries={conference} />
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
          <Badge variant="outline">THCPL: {conference.rank.thcpl}</Badge>
        )}
      </div>
    </div>
  );
}
