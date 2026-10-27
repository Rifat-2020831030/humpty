'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';

export const STORAGE_KEYS = {
  SESSION_ID: 'garikoi_session_id',
  ROLE: 'garikoi_role',
  ACTIVE_RIDE_ID: 'garikoi_active_ride_id',
} as const;

/**
 * Generates an ephemeral RFC4122 v4 UUID.
 * Uses crypto.randomUUID when available with Math.random fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

/**
 * Retrieves existing session ID from storage or creates and persists a new UUID.
 */
export function getOrCreateSessionId(storage: Storage | null = getStorage()): string {
  if (!storage) {
    return generateUUID();
  }
  try {
    const existing = storage.getItem(STORAGE_KEYS.SESSION_ID);
    if (existing && existing.trim().length > 0) {
      return existing;
    }
    const newId = generateUUID();
    storage.setItem(STORAGE_KEYS.SESSION_ID, newId);
    return newId;
  } catch {
    return generateUUID();
  }
}

/**
 * Retrieves current stored role or null.
 */
export function getStoredRole(storage: Storage | null = getStorage()): Role | null {
  if (!storage) return null;
  try {
    const val = storage.getItem(STORAGE_KEYS.ROLE);
    if (val === 'RIDER' || val === 'DRIVER') {
      return val as Role;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves current stored active ride ID or null.
 */
export function getStoredActiveRideId(storage: Storage | null = getStorage()): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEYS.ACTIVE_RIDE_ID) || null;
  } catch {
    return null;
  }
}

export interface UseSessionReturn {
  sessionId: string;
  role: Role | null;
  setRole: (role: Role) => void;
  clearRole: () => void;
  clearActiveRide: () => void;
  activeRideId: string | null;
  setActiveRideId: (rideId: string | null) => void;
}

/**
 * Client session hook managing ephemeral user session, role selection,
 * and active ride persistence across page reloads.
 */
export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>(() => {
    return getOrCreateSessionId();
  });

  const [role, setRoleState] = useState<Role | null>(() => {
    return getStoredRole();
  });

  const [activeRideId, setActiveRideIdState] = useState<string | null>(() => {
    return getStoredActiveRideId();
  });

  // Hydration sync for SSR where storage may only be accessible after mount
  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;

    const currentSessionId = getOrCreateSessionId(storage);
    setSessionId((prev) => (prev !== currentSessionId ? currentSessionId : prev));

    const storedRole = getStoredRole(storage);
    setRoleState((prev) => (prev !== storedRole ? storedRole : prev));

    const storedRide = getStoredActiveRideId(storage);
    setActiveRideIdState((prev) => (prev !== storedRide ? storedRide : prev));
  }, []);

  const setRole = useCallback((newRole: Role) => {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEYS.ROLE, newRole);
      } catch {
        // Safe fallback in restricted iframe/private mode
      }
    }
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    const storage = getStorage();
    if (storage) {
      try {
        storage.removeItem(STORAGE_KEYS.ROLE);
      } catch {
        // Safe fallback
      }
    }
    setRoleState(null);
  }, []);

  const clearActiveRide = useCallback(() => {
    const storage = getStorage();
    if (storage) {
      try {
        storage.removeItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
      } catch {
        // Safe fallback
      }
    }
    setActiveRideIdState(null);
  }, []);

  const setActiveRideId = useCallback((rideId: string | null) => {
    const storage = getStorage();
    if (storage) {
      try {
        if (rideId) {
          storage.setItem(STORAGE_KEYS.ACTIVE_RIDE_ID, rideId);
        } else {
          storage.removeItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
        }
      } catch {
        // Safe fallback
      }
    }
    setActiveRideIdState(rideId);
  }, []);

  return {
    sessionId,
    role,
    setRole,
    clearRole,
    clearActiveRide,
    activeRideId,
    setActiveRideId,
  };
}
