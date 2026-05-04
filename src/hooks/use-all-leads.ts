
"use client";

import { useState, useEffect, useCallback } from "react";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import type { Lead } from "@/lib/types";

export function useAllLeads() {
  const database = useDatabase();

  const leadsQuery = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'leads');
  }, [database]);

  const { data: leads, isLoading, error, mutate } = useList<Lead>(leadsQuery);

  return {
    leads: leads || [],
    isLoading,
    error,
    mutate,
  };
}
