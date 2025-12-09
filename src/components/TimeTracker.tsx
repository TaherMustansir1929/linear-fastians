"use client";

import { useEffect, useRef } from "react";
import { logTimeAction } from "@/app/actions";

interface TimeTrackerProps {
  documentId: string;
}

export function TimeTracker({ documentId }: TimeTrackerProps) {
  // Use a ref to track if tab is active
  const isTabActive = useRef(true);

  useEffect(() => {
    // Visibility API handlers
    const handleVisibilityChange = () => {
      isTabActive.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      if (isTabActive.current) {
        logTimeAction(documentId, 30);
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
      // Optional: Log any remaining time on unmount?
      // Complicated with server actions on unmount (often cancelled).
      // Stick to interval for simplicity.
    };
  }, [documentId]);

  return null; // Invisible component
}
