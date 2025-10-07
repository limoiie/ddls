import { isSubmissionPassed } from "../../lib/date";
import { ConfEdition, Conference } from "../../types/api";
import Timelines from "../Timelines";

interface ConferenceEditionProps {
  conf: ConfEdition;
  confSeries: Conference;
}

export default function ConferenceEdition({
  conf,
  confSeries,
}: ConferenceEditionProps) {
  const editionPassed = isSubmissionPassed(conf);
  return (
    <div
      key={conf.id}
      className={`flex flex-col lg:flex-row gap-4 relative ${
        editionPassed ? "opacity-70" : ""
      }`}
    >
      {editionPassed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-340">
            <span className="text-3xl font-bold text-red-500 opacity-50">
              PASSED
            </span>
          </div>
        </div>
      )}
      <div className="w-full lg:w-3/4 flex justify-between items-start">
        <div
          className={`w-full flex flex-col ${
            editionPassed
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <div className={`flex flex-row gap-4 items-start justify-between`}>
            <h3
              className={`font-bold whitespace-nowrap ${
                editionPassed
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-blue-600 dark:text-blue-400 hover:underline"
              }`}
            >
              <a href={conf.link} target="_blank" rel="noopener noreferrer">
                {confSeries.title.toUpperCase() + " " + conf.year}
              </a>
            </h3>
            <div className={`flex flex-col items-end gap-1`}>
              <p className={`text-sm`}>{conf.date}</p>
              <p className={`text-sm whitespace-nowrap`}>{conf.place}</p>
            </div>
          </div>
          <div
            className={`text-sm line-clamp-2`}
            title={confSeries.description}
          >
            {confSeries.description}
          </div>
          <div className="flex flex-col sm:flex-row gap-1 text-sm">
            <p className={`hidden sm:block`}>Website:</p>
            <a
              href={conf.link}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "break-all underline hover:text-blue-600 dark:hover:text-blue-400"
              }
            >
              {conf.link}
            </a>
          </div>
        </div>
      </div>
      <Timelines
        editionPassed={editionPassed}
        timelines={conf.timeline}
        timezone={conf.timezone}
        confId={conf.id}
      />
    </div>
  );
}
