"use client";

import { useEffect, useRef } from "react";
import { incrementViewAction } from "@/app/actions";

export function ViewTracker({ documentId }: { documentId: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      incrementViewAction(documentId);
      hasIncremented.current = true;
    }
  }, [documentId]);

  return null;
}
