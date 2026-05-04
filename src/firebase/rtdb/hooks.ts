'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DatabaseReference,
  onValue,
  DataSnapshot,
} from 'firebase/database';

export interface UseListResult<T> {
  data: (T & { id: string })[] | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void; // Add mutate function
}

/**
 * Transforms a Realtime Database snapshot of a list/object into an array of objects,
 * each with an `id` property.
 * @param snapshot The DataSnapshot from Realtime Database.
 * @returns An array of items, each including its key as `id`.
 */
function snapshotToFlatArray<T>(snapshot: DataSnapshot): (T & { id: string })[] {
  const items: (T & { id: string })[] = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      items.push({ id: childSnapshot.key, ...childSnapshot.val() } as T & { id: string });
    });
  }
  return items;
}

/**
 * Hook to subscribe to a list of data in Firebase Realtime Database.
 * @template T Type of the items in the list.
 * @param dbRef The DatabaseReference to the list. Can be null.
 * @returns An object containing the data, loading state, error, and a mutate function.
 */
export function useList<T = any>(
  dbRef: DatabaseReference | null
): UseListResult<T> {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0); // Add key to force re-fetch

  const mutate = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!dbRef) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshotToFlatArray<T>(snapshot));
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dbRef, key]); // Add key to dependency array

  return { data, isLoading, error, mutate };
}


export interface UseObjectValueResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to subscribe to a single object in Firebase Realtime Database.
 * @template T Type of the object.
 * @param dbRef The DatabaseReference to the object. Can be null.
 * @returns An object containing the data, loading state, and error.
 */
export function useObjectValue<T = any>(
  dbRef: DatabaseReference | null,
): UseObjectValueResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dbRef) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.exists() ? (snapshot.val() as T) : null);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dbRef]);

  return { data, isLoading, error };
}
