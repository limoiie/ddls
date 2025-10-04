"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface CountdownProps {
  deadline: Date;
  label?: string;
  className?: string;
  variant?: "default" | "compact";
}

export default function Countdown({
  deadline,
  label,
  className,
  variant = "default",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

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
    <div
      className={cn("flex items-center justify-end gap-2 font-mono", className)}
    >
      <div className="flex gap-1 flex-wrap">
        {timeLeft.days > 0 && (
          <span
            className={cn(
              "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded",
              variant === "compact" && "px-1"
            )}
          >
            {timeLeft.days}d
          </span>
        )}
        <span
          className={cn(
            "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded",
            variant === "compact" && "px-1"
          )}
        >
          {timeLeft.hours.toString().padStart(2, "0")}h
        </span>
        <span
          className={cn(
            "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded",
            variant === "compact" && "px-1"
          )}
        >
          {timeLeft.minutes.toString().padStart(2, "0")}m
        </span>
        <span
          className={cn(
            "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded",
            variant === "compact" && "px-1"
          )}
        >
          {timeLeft.seconds.toString().padStart(2, "0")}s
        </span>
      </div>
      {label && (
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}
