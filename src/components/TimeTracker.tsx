"use client";

import { useEffect, useRef } from "react";
import { client } from "@/lib/hono";

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
        client.api.documents[":id"]["log-time"].$post({
          param: { id: documentId },
          json: { seconds: 30 },
        });
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [documentId]);

  return null; // Invisible component
}
