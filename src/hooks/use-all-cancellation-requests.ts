"use client";

import { useState, useEffect, useCallback } from "react";
import type { CancellationRequest } from "@/lib/types";
import { getAllCancellationRequests } from "@/lib/actions";

export function useAllCancellationRequests() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllCancellationRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    mutate: fetchRequests,
  };
}
