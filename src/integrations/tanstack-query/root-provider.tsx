import * as React from "react";

import { defaultShouldDehydrateQuery, QueryClient, useQueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const isBrowser = typeof window !== "undefined";

const PERSIST_KEY = "ignita-query-cache";
/** One week — Riot data older than that is useless anyway. */
const PERSIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Only small, reusable payloads get persisted. Match bodies and timelines are
 * ~100KB each and would blow the localStorage quota in minutes; they rely on
 * the HTTP cache (max-age=30d on the route) + in-memory gcTime instead.
 */
function isPersistable(query: { queryKey: unknown }): boolean {
  const [namespace, kind] = query.queryKey as [string?, string?];
  if (namespace === "riot" && (kind === "match" || kind === "timeline")) {
    return false;
  }
  return true;
}

function dehydrateFilter(query: Parameters<typeof defaultShouldDehydrateQuery>[0]) {
  return defaultShouldDehydrateQuery(query) && isPersistable(query);
}

/** Created lazily on the client; the server never touches storage. */
let cachedPersister: Persister | undefined;
function getPersister(): Persister {
  if (!cachedPersister) {
    cachedPersister = createAsyncStoragePersister({
      storage: isBrowser ? window.localStorage : (undefined as unknown as Storage),
      key: PERSIST_KEY,
      throttleTime: 3_000,
    });
  }
  return cachedPersister;
}

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        // Cheap refetches: the API routes send aggressive Cache-Control +
        // stale-while-revalidate, so revalidating on focus rarely hits Riot.
        refetchOnWindowFocus: true,
        // Riot dev-key budget is tight: never hammer failures.
        retry: (failureCount, error) => {
          const status = (error as { status?: number }).status;
          // Client errors are deterministic — don't retry them (except 429).
          if (status !== undefined && status >= 400 && status < 500 && status !== 429) {
            return false;
          }
          // Key-invalid 503s are deterministic too (dev keys expire); retrying
          // just makes the user wait ~20s for the same message.
          const code = (error as { code?: string }).code;
          if (code === "key_invalid" || code === "missing_api_key" || code === "client_only") {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attempt) => (attempt === 0 ? 4_000 : 15_000),
      },
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}

/**
 * Wraps the app in PersistQueryClientProvider, whose `isRestoring` flag pauses
 * every query until the persisted cache has been restored.
 *
 * This is the load-bearing part for hydration correctness: TanStack Start
 * hydrates the shell first and deferred route content later, so a restore that
 * lands in between could give queries cached data while React is still
 * matching the server's skeleton HTML — the warm-reload hydration mismatch we
 * chased. With the official provider, all queries render as pending on both
 * the server AND the first client pass regardless of restore timing; cached
 * data arrives afterwards as a normal update.
 */
export function PersistedQueries({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: getPersister(),
        maxAge: PERSIST_MAX_AGE,
        dehydrateOptions: { shouldDehydrateQuery: dehydrateFilter },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
