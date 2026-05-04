
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";
import { getAllUsersForAdmin } from "@/lib/auth-actions"; // Importa a nova Server Action

export function useAllUserProfiles() {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profiles = await getAllUsersForAdmin();
      setUserProfiles(profiles);
    } catch (err: any) {
      setError(err);
      setUserProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    userProfiles,
    isLoading,
    error,
    mutate: fetchUsers, // A função mutate agora simplesmente chama fetchUsers novamente
  };
}
