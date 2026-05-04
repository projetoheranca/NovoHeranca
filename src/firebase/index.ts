
'use client';

import { database, storage } from './config';

// This file is simplified to re-export from the new structure

export { useSession } from '@/context/session-provider';

export function useDatabase() {
    return database;
}

export function useStorage() {
    return storage;
}

// Re-export RTDB hooks and other utilities
export * from './rtdb/hooks';
export * from './rtdb/memo';
