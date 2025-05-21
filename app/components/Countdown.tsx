"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  deadline: string;
  type: "abstract" | "paper";
}

export default function Countdown({ deadline, type }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
            {timeLeft.days}d
          </span>
        )}
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
          {timeLeft.hours}h
        </span>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
          {timeLeft.minutes}m
        </span>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
          {timeLeft.seconds}s
        </span>
      </div>
      <span className="text-gray-500 dark:text-gray-400 hidden md:block">
        {type === "abstract" ? "Abstract" : "Paper"}
      </span>
    </div>
  );
}
