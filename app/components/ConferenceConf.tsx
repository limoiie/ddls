import { ConferenceEvent, Timeline } from "../types/api";
import Countdown from "./Countdown";

interface ConferenceConfProps {
  conf: ConferenceEvent;
}

export default function ConferenceConf({ conf }: ConferenceConfProps) {
  return (
    <div
      key={conf.id}
      className="flex flex-row gap-4 border-t pt-4 dark:border-gray-700"
    >
      <div className="w-1/2 flex justify-between items-start">
        <div>
          <div className="flex flex-row gap-4 items-end">
            <h3 className="font-semibold">{conf.id.toUpperCase()}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {conf.date}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {conf.place}
          </p>
          <div className="flex flex-row gap-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">Website:</p>
            <a
              href={conf.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {conf.link}
            </a>
          </div>
        </div>
      </div>
      <div>
        {conf.timeline.map((timeline: Timeline, idx: number) => (
          <div key={idx} className="flex flex-col gap-2 text-sm">
            {timeline.abstract_deadline && (
              <div className="flex flex-col gap-1">
                <Countdown
                  deadline={timeline.abstract_deadline}
                  type="abstract"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  Abstract Deadline: {timeline.abstract_deadline}
                </p>
              </div>
            )}
            {timeline.deadline && (
              <div className="flex flex-col gap-1">
                <Countdown deadline={timeline.deadline} type="paper" />
                <p className="text-gray-600 dark:text-gray-400">
                  Paper Deadline: {timeline.deadline}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
