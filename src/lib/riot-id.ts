import { ApiError } from "./api/client";

export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
}

/**
 * Parses a Riot ID string formatted as `GameName#TAG`.
 * Splits on the last `#` to tolerate edge cases cleanly.
 */
export function parseRiotId(input: string): ParsedRiotId | null {
  const trimmed = input.trim();
  const hashIndex = trimmed.lastIndexOf("#");
  if (hashIndex <= 0 || hashIndex === trimmed.length - 1) {
    return null;
  }

  const gameName = trimmed.slice(0, hashIndex).trim();
  const tagLine = trimmed.slice(hashIndex + 1).trim();
  if (!gameName || !tagLine) {
    return null;
  }

  return { gameName, tagLine };
}

export interface FormattedRiotError {
  kind: "not_found" | "rate_limited" | "key_expired" | "bad_request" | "unknown";
  message: string;
  retryAfter?: number;
}

export function formatRiotError(error: unknown, retryCountdown?: number): FormattedRiotError {
  if (error instanceof ApiError) {
    if (error.status === 404 || error.code === "not_found") {
      return {
        kind: "not_found",
        message: "No summoner found with that Riot ID",
      };
    }

    if (error.status === 429 || error.code === "rate_limited") {
      const wait = retryCountdown ?? error.retryAfter;
      return {
        kind: "rate_limited",
        retryAfter: error.retryAfter,
        message:
          wait && wait > 0
            ? `Riot rate limit reached — retrying shortly (${wait}s)`
            : "Riot rate limit reached — retrying shortly",
      };
    }

    if (
      error.status === 503 ||
      error.code === "key_invalid" ||
      error.code === "key_expired" ||
      error.code === "missing_api_key"
    ) {
      return {
        kind: "key_expired",
        message: "API key expired — dev keys rotate every 24h",
      };
    }

    if (error.status === 400 || error.code === "bad_request") {
      return {
        kind: "bad_request",
        message: "Enter a Riot ID as GameName#TAG",
      };
    }
  }

  return {
    kind: "unknown",
    message: "Unable to reach Riot right now — try again shortly",
  };
}
