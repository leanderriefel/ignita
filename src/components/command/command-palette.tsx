import { useNavigate } from "@tanstack/react-router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
  CommandPage,
  CommandSeparator,
  createCommandController,
} from "@ui-sdk/react/command";
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "@ui-sdk/react/dialog";
import * as React from "react";

import { ApiError } from "../../lib/api/client";
import { useAccount } from "../../lib/api/queries";
import { useRecentSearches, useRegionPreference } from "../../lib/preferences";
import { formatRiotError, parseRiotId } from "../../lib/riot-id";
import { getPlatformInfo, isPlatform, PLATFORMS, type Platform } from "../../lib/riot/regions";
import { cn } from "../ui/cn";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  CompassIcon,
  GlobeIcon,
  HomeIcon,
  SearchIcon,
  SpinnerIcon,
} from "../ui/icons";
import { EXAMPLE_SUMMONERS } from "../ui/search-cluster";
import { useCommandPalette } from "./command-context";

interface PendingPaletteLookup {
  platform: Platform;
  gameName: string;
  tagLine: string;
  nonce: number;
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [region, setRegion] = useRegionPreference();
  const { recentSearches, recordSearch, clearRecentSearches } = useRecentSearches();

  const [command] = React.useState(() => createCommandController());
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState<string[]>([]);
  const [lookup, setLookup] = React.useState<PendingPaletteLookup | null>(null);
  const [retryCountdown, setRetryCountdown] = React.useState(0);

  const navigatedNonceRef = React.useRef<number>(0);

  const activePlatform = getPlatformInfo(region);
  const parsedQuery = React.useMemo(() => parseRiotId(query), [query]);

  const accountQuery = useAccount(
    lookup?.platform ?? region,
    lookup?.gameName ?? "",
    lookup?.tagLine ?? "",
    Boolean(lookup),
  );

  // Reset transient state whenever the palette closes.
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setPages([]);
      setLookup(null);
      setRetryCountdown(0);
    }
  }, [open]);

  // Navigate once a live Riot ID lookup completes.
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

    setOpen(false);
    void navigate({
      to: "/summoner/$platform/$name/$tag",
      params: {
        platform: lookup.platform,
        name: resolvedName,
        tag: resolvedTag,
      },
    });
  }, [lookup, accountQuery.data, accountQuery.isFetching, navigate, recordSearch, setOpen]);

  // Respect Retry-After on 429 rate limits inside the palette as well.
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

  const handleAction = React.useCallback(
    (value: string) => {
      if (value === "back") {
        command.pop();
        return;
      }

      if (value === "lookup-typed" && parsedQuery) {
        setLookup({
          platform: region,
          gameName: parsedQuery.gameName,
          tagLine: parsedQuery.tagLine,
          nonce: Date.now(),
        });
        return;
      }

      if (value === "clear-recent") {
        clearRecentSearches();
        return;
      }

      if (value === "nav:home") {
        setOpen(false);
        void navigate({ to: "/" });
        return;
      }

      if (value === "nav:sample-match") {
        setOpen(false);
        void navigate({
          to: "/match/$matchId",
          params: { matchId: "KR_7184402913" },
        });
        return;
      }

      if (value.startsWith("region:")) {
        const nextRegion = value.slice("region:".length);
        if (isPlatform(nextRegion)) {
          setRegion(nextRegion);
          command.pop();
        }
        return;
      }

      if (value.startsWith("summoner:")) {
        const [, rawPlatform, rawName, rawTag] = value.split(":");
        if (rawPlatform && isPlatform(rawPlatform) && rawName && rawTag) {
          const decodedName = decodeURIComponent(rawName);
          const decodedTag = decodeURIComponent(rawTag);
          recordSearch({
            platform: rawPlatform,
            gameName: decodedName,
            tagLine: decodedTag,
          });
          setOpen(false);
          void navigate({
            to: "/summoner/$platform/$name/$tag",
            params: {
              platform: rawPlatform,
              name: decodedName,
              tag: decodedTag,
            },
          });
        }
      }
    },
    [clearRecentSearches, command, navigate, parsedQuery, recordSearch, region, setOpen, setRegion],
  );

  const formattedError = queryError ? formatRiotError(queryError, retryCountdown) : null;
  const isResolving = Boolean(lookup) && accountQuery.isFetching;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[4px]" />
      <DialogContent
        aria-label="Command palette"
        className={cn(
          "fixed top-[10vh] left-1/2 z-50 w-[calc(100vw-24px)] max-w-[540px] -translate-x-1/2 overflow-hidden",
          "rounded-[12px] bg-panel text-fg hairline-strong shadow-[0_24px_64px_rgba(0,0,0,0.65)] outline-none",
        )}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        <Command
          controller={command}
          query={query}
          onQueryChange={(next) => {
            setQuery(next);
            if (lookup) {
              setLookup(null);
            }
          }}
          pages={pages}
          onPagesChange={setPages}
          onAction={handleAction}
          className="flex flex-col"
        >
          {/* Input header */}
          <div className="flex h-12 items-center gap-2.5 px-3.5 hairline-b">
            {isResolving ? (
              <SpinnerIcon className="h-4 w-4 shrink-0 text-fg" />
            ) : (
              <SearchIcon className="h-4 w-4 shrink-0 text-meta-fg" />
            )}

            {pages.length > 0 ? (
              <span className="rounded-[6px] bg-control px-2 py-0.5 text-[13px] font-medium text-muted-fg hairline">
                Region
              </span>
            ) : null}

            <CommandInput
              aria-label="Search summoners, regions, or routes"
              placeholder={
                pages.length > 0
                  ? "Filter regions…"
                  : `Search Riot ID (${activePlatform.short}) or jump to a route…`
              }
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-meta-fg"
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close command palette"
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-meta-fg transition-colors hover:bg-control hover:text-fg"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inline live-lookup error banner */}
          {formattedError ? (
            <div
              role="alert"
              className={cn(
                "flex items-center gap-2 bg-section/80 px-3.5 py-2 text-[13px] hairline-b",
                formattedError.kind === "rate_limited" || formattedError.kind === "key_expired"
                  ? "text-warning"
                  : "text-loss",
              )}
            >
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span className="tabular">{formattedError.message}</span>
            </div>
          ) : null}

          <CommandEmpty className="px-4 py-8 text-center text-[13px] text-meta-fg">
            {parsedQuery
              ? `Press Enter to search ${parsedQuery.gameName}#${parsedQuery.tagLine} on ${activePlatform.short}.`
              : "No matching commands. Type GameName#TAG to look up a summoner."}
          </CommandEmpty>

          <CommandList className="max-h-[340px] overflow-y-auto p-1.5">
            <CommandPage>
              {/* Dynamic direct lookup whenever a valid Riot ID is typed */}
              {parsedQuery ? (
                <>
                  <CommandGroup>
                    <CommandGroupLabel className="px-2.5 pt-1.5 pb-1 text-[13px] font-medium text-meta-fg">
                      Live lookup
                    </CommandGroupLabel>
                    <CommandItem
                      value="lookup-typed"
                      label={`${parsedQuery.gameName}#${parsedQuery.tagLine}`}
                      keywords={[query, parsedQuery.gameName, parsedQuery.tagLine]}
                      className={ITEM_CLASS}
                    >
                      <CommandItemIcon className="text-meta-fg">
                        <SearchIcon className="h-4 w-4" />
                      </CommandItemIcon>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                        <span className="truncate font-medium text-fg">{parsedQuery.gameName}</span>
                        <span className="text-meta-fg">#{parsedQuery.tagLine}</span>
                      </span>
                      <span className="rounded-[6px] bg-control px-1.5 py-0.5 text-[13px] font-medium text-muted-fg tabular hairline">
                        {activePlatform.short}
                      </span>
                      <ArrowRightIcon className="h-3.5 w-3.5 text-meta-fg" />
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator className="my-1.5 h-px bg-[var(--hairline-color)]" />
                </>
              ) : null}

              {/* Recent searches (localStorage, last 5) */}
              {recentSearches.length > 0 ? (
                <>
                  <CommandGroup>
                    <CommandGroupLabel className="px-2.5 pt-1.5 pb-1 text-[13px] font-medium text-meta-fg">
                      Recent searches
                    </CommandGroupLabel>
                    {recentSearches.map((item) => {
                      const info = getPlatformInfo(item.platform);
                      const encoded = `summoner:${item.platform}:${encodeURIComponent(item.gameName)}:${encodeURIComponent(item.tagLine)}`;
                      return (
                        <CommandItem
                          key={encoded}
                          value={encoded}
                          label={`${item.gameName}#${item.tagLine}`}
                          keywords={[info.short, info.label]}
                          className={ITEM_CLASS}
                        >
                          <CommandItemIcon className="text-meta-fg">
                            <ClockIcon className="h-4 w-4" />
                          </CommandItemIcon>
                          <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
                            <CommandItemText className="truncate font-medium text-fg">
                              {item.gameName}
                            </CommandItemText>
                            <span className="text-meta-fg">#{item.tagLine}</span>
                          </span>
                          <span className="rounded-[6px] bg-control px-1.5 py-0.5 text-[13px] font-medium text-meta-fg tabular hairline">
                            {info.short}
                          </span>
                        </CommandItem>
                      );
                    })}
                    <CommandItem
                      value="clear-recent"
                      label="Clear recent searches"
                      keywords={["history", "remove", "reset"]}
                      className={ITEM_CLASS}
                    >
                      <CommandItemIcon className="text-meta-fg">
                        <CloseIcon className="h-3.5 w-3.5" />
                      </CommandItemIcon>
                      <span className="text-meta-fg">Clear recent searches</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator className="my-1.5 h-px bg-[var(--hairline-color)]" />
                </>
              ) : null}

              {/* Region quick-switch */}
              <CommandGroup>
                <CommandGroupLabel className="px-2.5 pt-1.5 pb-1 text-[13px] font-medium text-meta-fg">
                  Region
                </CommandGroupLabel>
                <CommandItem
                  value="open-regions"
                  page="regions"
                  label="Switch region"
                  keywords={["server", "platform", "kr", "euw", "na", "eune"]}
                  className={ITEM_CLASS}
                >
                  <CommandItemIcon className="text-meta-fg">
                    <GlobeIcon className="h-4 w-4" />
                  </CommandItemIcon>
                  <CommandItemText className="flex-1 text-fg">Switch region</CommandItemText>
                  <span className="text-meta-fg">
                    {activePlatform.short} · {activePlatform.label}
                  </span>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-meta-fg" />
                </CommandItem>
              </CommandGroup>

              <CommandSeparator className="my-1.5 h-px bg-[var(--hairline-color)]" />

              {/* Navigation & featured summoners */}
              <CommandGroup>
                <CommandGroupLabel className="px-2.5 pt-1.5 pb-1 text-[13px] font-medium text-meta-fg">
                  Navigation
                </CommandGroupLabel>
                <CommandItem
                  value="nav:home"
                  label="Home"
                  keywords={["landing", "search", "start"]}
                  className={ITEM_CLASS}
                >
                  <CommandItemIcon className="text-meta-fg">
                    <HomeIcon className="h-4 w-4" />
                  </CommandItemIcon>
                  <CommandItemText className="flex-1 text-fg">Home</CommandItemText>
                  <span className="text-meta-fg">/</span>
                </CommandItem>

                {EXAMPLE_SUMMONERS.map((example) => {
                  const info = getPlatformInfo(example.platform);
                  const encoded = `summoner:${example.platform}:${encodeURIComponent(example.gameName)}:${encodeURIComponent(example.tagLine)}`;
                  return (
                    <CommandItem
                      key={example.riotId}
                      value={encoded}
                      label={`${example.gameName}#${example.tagLine}`}
                      keywords={["summoner", "profile", info.short, info.label]}
                      className={ITEM_CLASS}
                    >
                      <CommandItemIcon className="text-meta-fg">
                        <CompassIcon className="h-4 w-4" />
                      </CommandItemIcon>
                      <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
                        <CommandItemText className="truncate text-fg">
                          {example.gameName}
                        </CommandItemText>
                        <span className="text-meta-fg">#{example.tagLine}</span>
                      </span>
                      <span className="rounded-[6px] bg-control px-1.5 py-0.5 text-[13px] font-medium text-meta-fg tabular hairline">
                        {info.short}
                      </span>
                    </CommandItem>
                  );
                })}

                <CommandItem
                  value="nav:sample-match"
                  label="Sample match breakdown"
                  keywords={["match", "detail", "KR_7184402913"]}
                  className={ITEM_CLASS}
                >
                  <CommandItemIcon className="text-meta-fg">
                    <ArrowRightIcon className="h-4 w-4" />
                  </CommandItemIcon>
                  <CommandItemText className="flex-1 text-fg">
                    Sample match breakdown
                  </CommandItemText>
                  <span className="text-meta-fg tabular">KR_7184402913</span>
                </CommandItem>
              </CommandGroup>
            </CommandPage>

            {/* Region picker page */}
            <CommandPage value="regions">
              <CommandGroup>
                <CommandGroupLabel className="px-2.5 pt-1.5 pb-1 text-[13px] font-medium text-meta-fg">
                  Select region
                </CommandGroupLabel>
                {PLATFORMS.map((platform) => {
                  const isCurrent = platform.id === region;
                  return (
                    <CommandItem
                      key={platform.id}
                      value={`region:${platform.id}`}
                      label={`${platform.short} ${platform.label}`}
                      keywords={[platform.id, platform.route]}
                      className={ITEM_CLASS}
                    >
                      <span className="w-11 shrink-0 font-semibold text-fg tabular">
                        {platform.short}
                      </span>
                      <CommandItemText className="flex-1 text-muted-fg">
                        {platform.label}
                      </CommandItemText>
                      {isCurrent ? <CheckIcon className="h-3.5 w-3.5 text-fg" /> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandPage>

            {pages.length > 0 ? (
              <>
                <CommandSeparator className="my-1.5 h-px bg-[var(--hairline-color)]" />
                <CommandItem value="back" label="Back" className={ITEM_CLASS}>
                  <CommandItemIcon className="text-meta-fg">
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                  </CommandItemIcon>
                  <span className="text-muted-fg">Back</span>
                </CommandItem>
              </>
            ) : null}
          </CommandList>

          {/* Quiet keyboard footer */}
          <div className="flex items-center justify-between gap-4 bg-section/60 px-3.5 py-2 text-[13px] text-meta-fg hairline-t">
            <span>Enter to select · Esc to close</span>
            <span className="tabular">{activePlatform.short}</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const ITEM_CLASS = cn(
  "flex h-9 cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 text-[13px] select-none outline-none",
  "text-muted-fg transition-colors duration-100",
  "data-highlighted:bg-section data-highlighted:text-fg",
  "[&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-fg",
);
