
"use client";

import { useSession } from "@/context/session-provider";
import { useDatabase } from "@/firebase";
import { ref, onValue, type Unsubscribe } from "firebase/database";
import type { UserProfile } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { useMemoFirebase } from "@/firebase";

export function useUserProfile() {
  const { session, isLoading: isSessionLoading, login } = useSession();
  const database = useDatabase();

  const userProfileRef = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/document`);
  }, [session?.uid, database]);

  const [profileData, setProfileData] = useState<Omit<UserProfile, 'id' | 'uid'> | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(() => {
    if (!userProfileRef) return;
    setIsLoadingProfile(true);
    
    // Declara a variável unsubscribe antes para que esteja no escopo correto.
    let unsubscribe: Unsubscribe;
    
    unsubscribe = onValue(userProfileRef, (snapshot) => {
        if (snapshot.exists()) {
            const newProfileData = snapshot.val();
            setProfileData(newProfileData);
            if (session) {
                // Use a functional update to ensure we have the latest session state
                login({ ...session, ...newProfileData });
            }
        }
        setIsLoadingProfile(false);
        // Desinscreve após buscar os dados para a mutação.
        if (unsubscribe) unsubscribe();
    }, (err) => {
        setError(err);
        setIsLoadingProfile(false);
        // Desinscreve também em caso de erro.
        if (unsubscribe) unsubscribe();
    });
  }, [userProfileRef, session, login]);

  useEffect(() => {
    if (!userProfileRef) {
        setIsLoadingProfile(false);
        return;
    }

    setIsLoadingProfile(true);
    const unsubscribe = onValue(userProfileRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.val());
        }
        setIsLoadingProfile(false);
      },
      (err) => {
        setError(err);
        setIsLoadingProfile(false);
      }
    );

    return () => unsubscribe();
  }, [userProfileRef]);

  const userProfile = session ? { ...session, ...profileData } : null;

  return {
    userProfile,
    isLoading: isSessionLoading || isLoadingProfile,
    error,
    mutate,
  };
}
