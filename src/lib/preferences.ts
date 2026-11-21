import * as React from "react";

import { isPlatform, type Platform } from "./riot/regions";

const REGION_STORAGE_KEY = "ignita:region";
const RECENT_STORAGE_KEY = "ignita:recent-searches";
const PREFS_EVENT = "ignita:prefs-changed";
const MAX_RECENT = 5;
const DEFAULT_PLATFORM: Platform = "kr";

export interface RecentSearch {
  platform: Platform;
  gameName: string;
  tagLine: string;
  searchedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyPrefsChanged() {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(PREFS_EVENT));
  }
}

export function getStoredRegion(): Platform {
  if (!isBrowser()) {
    return DEFAULT_PLATFORM;
  }
  try {
    const raw = window.localStorage.getItem(REGION_STORAGE_KEY);
    if (raw && isPlatform(raw)) {
      return raw;
    }
  } catch {
    // Ignore storage access errors (private browsing, quota, etc.)
  }
  return DEFAULT_PLATFORM;
}

export function setStoredRegion(platform: Platform): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(REGION_STORAGE_KEY, platform);
  } catch {
    // Ignore storage write errors
  }
  notifyPrefsChanged();
}

export function getRecentSearches(): RecentSearch[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item): item is RecentSearch =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as RecentSearch).platform === "string" &&
          isPlatform((item as RecentSearch).platform) &&
          typeof (item as RecentSearch).gameName === "string" &&
          typeof (item as RecentSearch).tagLine === "string",
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function addRecentSearch(entry: Omit<RecentSearch, "searchedAt">): RecentSearch[] {
  const existing = getRecentSearches();
  const key = `${entry.platform}:${entry.gameName.toLowerCase()}#${entry.tagLine.toLowerCase()}`;
  const deduped = existing.filter(
    (item) =>
      `${item.platform}:${item.gameName.toLowerCase()}#${item.tagLine.toLowerCase()}` !== key,
  );
  const next: RecentSearch[] = [{ ...entry, searchedAt: Date.now() }, ...deduped].slice(
    0,
    MAX_RECENT,
  );

  if (isBrowser()) {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
    notifyPrefsChanged();
  }
  return next;
}

export function clearRecentSearches(): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.removeItem(RECENT_STORAGE_KEY);
  } catch {
    // Ignore storage write errors
  }
  notifyPrefsChanged();
}

export function useRegionPreference(): [Platform, (platform: Platform) => void] {
  const [region, setRegionState] = React.useState<Platform>(DEFAULT_PLATFORM);

  React.useEffect(() => {
    setRegionState(getStoredRegion());

    const sync = () => setRegionState(getStoredRegion());
    window.addEventListener(PREFS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setRegion = React.useCallback((next: Platform) => {
    setRegionState(next);
    setStoredRegion(next);
  }, []);

  return [region, setRegion];
}

export function useRecentSearches() {
  const [items, setItems] = React.useState<RecentSearch[]>([]);

  React.useEffect(() => {
    setItems(getRecentSearches());

    const sync = () => setItems(getRecentSearches());
    window.addEventListener(PREFS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const record = React.useCallback((entry: Omit<RecentSearch, "searchedAt">) => {
    const next = addRecentSearch(entry);
    setItems(next);
  }, []);

  const clear = React.useCallback(() => {
    clearRecentSearches();
    setItems([]);
  }, []);

  return { recentSearches: items, recordSearch: record, clearRecentSearches: clear };
}
