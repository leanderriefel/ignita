import { useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { ApiError } from "../../lib/api/client";
import { useAccount } from "../../lib/api/queries";
import { useRecentSearches, useRegionPreference } from "../../lib/preferences";
import { formatRiotError, parseRiotId } from "../../lib/riot-id";
import type { Platform } from "../../lib/riot/regions";
import { Button } from "./button";
import { Chip } from "./chip";
import { cn } from "./cn";
import { AlertCircleIcon, ArrowRightIcon, SearchIcon } from "./icons";
import { RegionSelect } from "./region-select";

export interface ExampleSummoner {
  riotId: string;
  gameName: string;
  tagLine: string;
  platform: Platform;
}

export const EXAMPLE_SUMMONERS: ExampleSummoner[] = [
  { riotId: "Hide on bush#KR1", gameName: "Hide on bush", tagLine: "KR1", platform: "kr" },
  { riotId: "Doublelift#NA1", gameName: "Doublelift", tagLine: "NA1", platform: "na1" },
  { riotId: "Caps#EUW", gameName: "Caps", tagLine: "EUW", platform: "euw1" },
];

interface ActiveLookup {
  platform: Platform;
  gameName: string;
  tagLine: string;
  nonce: number;
}

export interface SearchClusterProps {
  className?: string;
  showExamples?: boolean;
  autoFocus?: boolean;
}

export function SearchCluster({
  className,
  showExamples = true,
  autoFocus = false,
}: SearchClusterProps) {
  const navigate = useNavigate();
  const [platform, setPlatform] = useRegionPreference();
  const { recordSearch } = useRecentSearches();

  const [inputValue, setInputValue] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [lookup, setLookup] = React.useState<ActiveLookup | null>(null);
  const [retryCountdown, setRetryCountdown] = React.useState<number>(0);

  const navigatedNonceRef = React.useRef<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const accountQuery = useAccount(
    lookup?.platform ?? platform,
    lookup?.gameName ?? "",
    lookup?.tagLine ?? "",
    Boolean(lookup),
  );

  const isSearching = Boolean(lookup) && accountQuery.isFetching;

  // Navigate once the active lookup resolves with a RiotAccount.
  React.useEffect(() => {
    if (!lookup || !accountQuery.data || accountQuery.isFetching) {
      return;
    }
    if (navigatedNonceRef.current === lookup.nonce) {
      return;
    }
    navigatedNonceRef.current = lookup.nonce;

    const resolvedName = accountQuery.data.gameName ?? lookup.gameName;
    const resolvedTag = accountQuery.data.tagLine ?? lookup.tagLine;

    recordSearch({
      platform: lookup.platform,
      gameName: resolvedName,
      tagLine: resolvedTag,
    });

    void navigate({
      to: "/summoner/$platform/$name/$tag",
      params: {
        platform: lookup.platform,
        name: resolvedName,
        tag: resolvedTag,
      },
    });
  }, [lookup, accountQuery.data, accountQuery.isFetching, navigate, recordSearch]);

  // Respect Retry-After on 429 rate limits and auto-retry once the window clears.
  const queryError = lookup ? accountQuery.error : null;
  React.useEffect(() => {
    if (!(queryError instanceof ApiError) || queryError.status !== 429) {
      setRetryCountdown(0);
      return;
    }

    const waitSeconds = Math.max(1, Math.ceil(queryError.retryAfter ?? 5));
    setRetryCountdown(waitSeconds);

    const intervalId = window.setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const retryTimer = window.setTimeout(() => {
      void accountQuery.refetch();
    }, waitSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(retryTimer);
    };
  }, [queryError, accountQuery.refetch]);

  const submitSearch = React.useCallback((rawInput: string, targetPlatform: Platform) => {
    const parsed = parseRiotId(rawInput);
    if (!parsed) {
      setLookup(null);
      setValidationError("Enter a Riot ID as GameName#TAG");
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    setRetryCountdown(0);
    setLookup({
      platform: targetPlatform,
      gameName: parsed.gameName,
      tagLine: parsed.tagLine,
      nonce: Date.now(),
    });
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch(inputValue, platform);
  };

  const handleExampleClick = (example: ExampleSummoner) => {
    setInputValue(example.riotId);
    setPlatform(example.platform);
    submitSearch(example.riotId, example.platform);
  };

  const formattedError = queryError ? formatRiotError(queryError, retryCountdown) : null;
  const errorMessage = validationError ?? formattedError?.message ?? null;

  return (
    <div className={cn("w-full max-w-[600px] sm:w-[600px]", className)}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(
          "surface-over-art flex min-h-[64px] flex-col gap-2 rounded-[12px] p-2 hairline-divider transition-[border-color] duration-150 ease-out",
          "focus-within:hairline-strong sm:flex-row sm:items-center sm:gap-0 sm:p-1.5 sm:pl-4",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1 sm:px-0 sm:py-0">
          <SearchIcon className="h-4 w-4 shrink-0 text-meta-fg" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Riot ID"
            aria-invalid={Boolean(errorMessage) || undefined}
            placeholder="Hide on bush#KR1"
            onChange={(event) => {
              setInputValue(event.target.value);
              if (validationError) {
                setValidationError(null);
              }
              if (lookup && accountQuery.isError) {
                setLookup(null);
              }
            }}
            className={cn(
              "h-10 min-w-0 flex-1 bg-transparent text-[16px] font-medium text-fg outline-none",
              "placeholder:font-normal placeholder:text-meta-fg/80",
            )}
          />

          {/* Mobile inline region selector */}
          <div className="flex shrink-0 items-center pl-1 hairline-divider-l sm:hidden">
            <RegionSelect
              value={platform}
              onValueChange={(next) => {
                setPlatform(next);
                if (lookup) {
                  setLookup(null);
                }
              }}
              variant="embedded"
            />
          </div>
        </div>

        {/* Desktop region divider + selector */}
        <div className="hidden h-7 shrink-0 items-center pl-2 pr-1.5 hairline-divider-l sm:flex">
          <RegionSelect
            value={platform}
            onValueChange={(next) => {
              setPlatform(next);
              if (lookup) {
                setLookup(null);
              }
            }}
            variant="embedded"
          />
        </div>

        {/* Primary gold CTA — the view's single gold moment */}
        <Button
          type="submit"
          variant="primary"
          size="cta"
          loading={isSearching}
          disabled={retryCountdown > 0}
          className="h-[50px] w-full sm:w-auto sm:min-w-[122px]"
        >
          <span>{isSearching ? "Looking up" : "Search"}</span>
          {!isSearching ? <ArrowRightIcon className="h-4 w-4" /> : null}
        </Button>
      </form>

      {/* Inline error / rate-limit state */}
      {errorMessage ? (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            "mt-2.5 flex items-center gap-2 rounded-[8px] bg-panel/90 px-3 py-2 text-[13px] hairline-divider",
            formattedError?.kind === "rate_limited" || formattedError?.kind === "key_expired"
              ? "text-warning"
              : "text-loss",
          )}
        >
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span className="tabular">{errorMessage}</span>
        </div>
      ) : null}

      {/* Example Riot ID chips */}
      {showExamples ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-meta-fg">Try</span>
          {EXAMPLE_SUMMONERS.map((example) => (
            <button
              key={example.riotId}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="inline-flex h-7 items-center rounded-full focus-visible:outline-2"
            >
              <Chip
                variant="neutral"
                interactive
                className="h-7 px-2.5 py-0 text-[13px] hairline-divider"
              >
                <span className="text-fg">{example.gameName}</span>
                <span className="text-meta-fg">#{example.tagLine}</span>
              </Chip>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
