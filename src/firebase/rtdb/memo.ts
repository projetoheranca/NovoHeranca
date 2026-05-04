"use client";

import { useMemo } from 'react';

/**
 * A custom hook that memoizes a value based on a dependency array.
 * This is a simple wrapper around React's useMemo for semantic clarity when dealing
 * with Firebase references or queries.
 *
 * @param factory A function that creates the value to be memoized.
 * @param deps An array of dependencies. The factory is re-run only if these change.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
