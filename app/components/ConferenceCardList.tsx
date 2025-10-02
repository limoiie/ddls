"use client";

import { Conference } from "../types/api";
import ConferenceCard from "./ConferenceCard";

interface ConferenceCardListProps {
  conferences: Conference[];
  loading: boolean;
  pinnedIds: string[];
  onTogglePin: (title: string) => void;
}

export default function ConferenceCardList({
  conferences,
  loading,
  pinnedIds,
  onTogglePin,
}: ConferenceCardListProps) {
  return (
    <>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          conferences.map((conference) => (
            <ConferenceCard
              key={conference.title.toUpperCase()}
              conference={conference}
              pinnedIds={pinnedIds}
              onTogglePin={onTogglePin}
            />
          ))
        )}
      </div>
    </>
  );
}
