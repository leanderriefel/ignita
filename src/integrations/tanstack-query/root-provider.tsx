import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";

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

  if (isBrowser) {
    const persister = createAsyncStoragePersister({
      storage: window.localStorage,
      key: PERSIST_KEY,
      throttleTime: 3_000,
    });

    void persistQueryClientRestore({
      queryClient,
      persister,
      maxAge: PERSIST_MAX_AGE,
    }).then(() => {
      persistQueryClientSubscribe({
        queryClient,
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) && isPersistable(query),
        },
      });
    });
  }

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
