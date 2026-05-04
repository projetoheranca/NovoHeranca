
"use client";

import type { UserProfile } from "@/lib/types";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged, type User, setPersistence, browserLocalPersistence, type MultiFactorResolver, type Unsubscribe as AuthUnsubscribe } from 'firebase/auth';
import { auth, database } from "@/firebase/config";
import { ref, onValue, type Unsubscribe as RtdbUnsubscribe } from "firebase/database";

interface SessionContextType {
  session: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: (userProfile: UserProfile) => void;
  mfaResolver: MultiFactorResolver | null;
  setMfaResolver: (resolver: MultiFactorResolver | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);

  const login = useCallback((userProfile: UserProfile) => {
    setSession(userProfile);
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
    setSession(null);
    setMfaResolver(null);
  }, []);
  
  useEffect(() => {
    let rtdbUnsubscribe: RtdbUnsubscribe | null = null;
    
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.error("Error setting auth persistence:", error);
    });

    const authUnsubscribe: AuthUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (rtdbUnsubscribe) {
        rtdbUnsubscribe();
      }

      if (firebaseUser) {
        setIsLoading(true);
        const userProfileRef = ref(database, `users/${firebaseUser.uid}/document`);
        
        rtdbUnsubscribe = onValue(userProfileRef, (snapshot) => {
          if (snapshot.exists()) {
            const userProfileData = snapshot.val();
            const fullSession: UserProfile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              emailVerified: firebaseUser.emailVerified,
              ...userProfileData
            };
            setSession(fullSession);
            setMfaResolver(null);
          } else {
            console.error("User profile not in RTDB, logging out.", firebaseUser.uid);
            logout();
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          logout();
          setIsLoading(false);
        });

      } else {
        setSession(null);
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (rtdbUnsubscribe) {
        rtdbUnsubscribe();
      }
    };
  }, [logout]);


  return (
    <SessionContext.Provider value={{ session, isLoading, logout, login, mfaResolver, setMfaResolver }}>
       {isLoading && !mfaResolver ? (
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          children
        )}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
