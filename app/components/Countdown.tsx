"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface CountdownProps {
  deadline: Date;
  label?: string;
  className?: string;
  variant?: "default" | "compact";
  animated?: boolean;
}

export default function Countdown({
  deadline,
  label,
  className,
  variant = "default",
  animated = true,
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

  const renderTimeUnit = (value: number, unit: string, isDays = false) => {
    const baseClasses = cn(
      "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded",
      variant === "compact" && "px-1"
    );

    if (animated) {
      const countdownClasses = cn(
        "countdown",
        isDays && value > 99 ? "bit3" : "bit2"
      );

      return (
        <div className={baseClasses}>
          <div className={countdownClasses}>
            <div
              className="countdown-item text-center"
              style={{ "--value": value } as React.CSSProperties}
            />
          </div>
          <span className="ml-1 uppercase">{unit}</span>
        </div>
      );
    }

    return (
      <span className={baseClasses}>
        {isDays
          ? `${value}${unit}`
          : `${value.toString().padStart(2, "0")}${unit}`}
      </span>
    );
  };

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {label && (
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
      )}
      <div className={cn("flex gap-1 font-mono", !animated && "flex-wrap")}>
        {timeLeft.days > 0 && <>{renderTimeUnit(timeLeft.days, "d", true)}</>}
        {renderTimeUnit(timeLeft.hours, "h")}
        {renderTimeUnit(timeLeft.minutes, "m")}
        {renderTimeUnit(timeLeft.seconds, "s")}
      </div>
    </div>
  );
}
