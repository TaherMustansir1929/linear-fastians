"use client";

import { useEffect, useRef } from "react";
import { client } from "@/lib/hono";

export function ViewTracker({ documentId }: { documentId: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      client.api.documents[":id"].view.$post({
        param: { id: documentId },
      });
      hasIncremented.current = true;
    }
  }, [documentId]);

  return null;
}
