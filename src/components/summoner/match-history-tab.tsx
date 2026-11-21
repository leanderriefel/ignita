import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "@ui-sdk/react/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import * as React from "react";

import { QUEUE_FILTERS } from "../../lib/api/queues";
import {
  buildMatchRowViewModel,
  computeSummaryBandData,
  type MatchAssetLookups,
  type MatchRowViewModel,
} from "../../lib/match/transform";
import { useMatches, usePagedMatchIds } from "../../lib/match/use-matches";
import { formatRiotError } from "../../lib/riot-id";
import type { Platform } from "../../lib/riot/regions";
import type { MatchDTO } from "../../lib/riot/types";
import { MatchRow } from "../match/match-row";
import { SummaryBand } from "../stats/summary-band";
import { Button } from "../ui/button";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, CloseIcon } from "../ui/icons";
import { SegmentedControl } from "../ui/segmented-control";
import { MatchRowSkeleton, Skeleton } from "../ui/skeleton";

type QueueFilterValue = "all" | "420" | "440" | "450";
type ResultFilterValue = "all" | "wins" | "losses";
type SortOrderValue = "newest" | "oldest";

const QUEUE_OPTIONS: { value: QueueFilterValue; label: string; queueId?: number }[] = [
  { value: "all", label: "All queues" },
  ...QUEUE_FILTERS.map((q) => ({
    value: String(q.id) as QueueFilterValue,
    label: q.label,
    queueId: q.id,
  })),
];

type VirtualItem =
  | {
      kind: "day";
      key: string;
      label: string;
      wins: number;
      losses: number;
      remakes: number;
    }
  | {
      kind: "match";
      key: string;
      matchId: string;
      viewModel: MatchRowViewModel;
      rawMatch: MatchDTO;
    }
  | {
      kind: "skeleton";
      key: string;
      matchId: string;
      opacity: number;
    };

export interface MatchHistoryTabProps {
  platform: Platform;
  puuid: string;
  lookups: MatchAssetLookups;
}

function SummaryBandSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[1200px] overflow-hidden rounded-[12px] bg-panel hairline-divider"
    >
      <div className="grid min-h-[132px] grid-cols-2 lg:grid-cols-[minmax(200px,200fr)_minmax(280px,280fr)_minmax(160px,160fr)_minmax(150px,150fr)_minmax(150px,150fr)_minmax(160px,160fr)]">
        <div className="col-span-2 flex flex-col justify-between gap-3 px-5 py-4 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-3.5 w-20 opacity-65" />
        </div>
        <div className="col-span-2 flex flex-col justify-between gap-3 px-5 py-4 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-full opacity-75" />
          <Skeleton className="h-3.5 w-20 opacity-60" />
        </div>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col justify-between gap-3 px-5 py-4",
              idx < 3 && "lg:hairline-divider-r",
            )}
          >
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3.5 w-12 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Match History tab:
 * - SummaryBand wired to live loaded matches
 * - Filter bar (Queue select, Result segmented control, Sort order; 390px sheet)
 * - TanStack Virtual window-virtualized list with dynamic measureElement & day headers
 * - Progressive hydration from match IDs + Load more (+20 per page)
 */
export function MatchHistoryTab({ platform, puuid, lookups }: MatchHistoryTabProps) {
  const [queueFilter, setQueueFilter] = React.useState<QueueFilterValue>("all");
  const [resultFilter, setResultFilter] = React.useState<ResultFilterValue>("all");
  const [sortOrder, setSortOrder] = React.useState<SortOrderValue>("newest");
  const [pageCount, setPageCount] = React.useState(1);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const selectedQueueOption =
    QUEUE_OPTIONS.find((opt) => opt.value === queueFilter) ?? QUEUE_OPTIONS[0]!;

  // Reset pagination when queue filter or summoner changes
  React.useEffect(() => {
    setPageCount(1);
    setExpandedIds(new Set());
  }, [queueFilter, puuid, platform]);

  const { matchIds, isInitialLoading, isFetchingNextPage, hasMore, error } = usePagedMatchIds(
    platform,
    puuid,
    selectedQueueOption.queueId,
    pageCount,
  );

  const { byId, resolvedMatches, isAnyPending } = useMatches(matchIds);

  // SummaryBand computes from first 20 loaded matches, with deltas vs prior 20 when loaded
  const summaryData = React.useMemo(() => {
    const recent = resolvedMatches.slice(0, 20);
    const prior = resolvedMatches.slice(20, 40);
    return computeSummaryBandData(recent, prior, puuid);
  }, [resolvedMatches, puuid]);

  // Build ordered view models + day headers for the virtualized list
  const virtualItems = React.useMemo<VirtualItem[]>(() => {
    const hydrated: { viewModel: MatchRowViewModel; rawMatch: MatchDTO }[] = [];
    const pendingIds: string[] = [];

    for (const id of matchIds) {
      const state = byId.get(id);
      if (state?.data) {
        const vm = buildMatchRowViewModel(state.data, puuid, lookups);
        if (vm) {
          hydrated.push({ viewModel: vm, rawMatch: state.data });
        }
      } else if (!state?.isError) {
        pendingIds.push(id);
      }
    }

    const filtered = hydrated.filter(({ viewModel }) => {
      if (resultFilter === "wins") {
        return viewModel.win && !viewModel.isRemake;
      }
      if (resultFilter === "losses") {
        return !viewModel.win && !viewModel.isRemake;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) =>
      sortOrder === "newest"
        ? b.viewModel.timestampMs - a.viewModel.timestampMs
        : a.viewModel.timestampMs - b.viewModel.timestampMs,
    );

    // Group contiguous matches by calendar day
    const out: VirtualItem[] = [];
    let currentDayKey: string | null = null;
    let currentDayHeaderIndex = -1;

    for (const entry of sorted) {
      const { viewModel, rawMatch } = entry;
      if (viewModel.dayKey !== currentDayKey) {
        currentDayKey = viewModel.dayKey;
        currentDayHeaderIndex = out.length;
        out.push({
          kind: "day",
          key: `day-${viewModel.dayKey}-${currentDayHeaderIndex}`,
          label: viewModel.dayLabel,
          wins: 0,
          losses: 0,
          remakes: 0,
        });
      }

      const header = out[currentDayHeaderIndex];
      if (header && header.kind === "day") {
        if (viewModel.isRemake) {
          header.remakes += 1;
        } else if (viewModel.win) {
          header.wins += 1;
        } else {
          header.losses += 1;
        }
      }

      out.push({
        kind: "match",
        key: viewModel.id,
        matchId: viewModel.id,
        viewModel,
        rawMatch,
      });
    }

    // Show progressive hydration skeletons for in-flight match IDs when unfiltered
    if (resultFilter === "all") {
      pendingIds.forEach((id, idx) => {
        out.push({
          kind: "skeleton",
          key: `skel-${id}`,
          matchId: id,
          opacity: Math.max(0.35, 1 - idx * 0.12),
        });
      });
    }

    return out;
  }, [matchIds, byId, puuid, lookups, resultFilter, sortOrder]);

  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = React.useState(0);

  React.useLayoutEffect(() => {
    const updateOffset = () => {
      if (listRef.current) {
        setScrollMargin(listRef.current.offsetTop);
      }
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (!item) {
        return 104;
      }
      if (item.kind === "day") {
        return 38;
      }
      if (item.kind === "match" && expandedIds.has(item.matchId)) {
        return 340;
      }
      return 102;
    },
    overscan: 6,
    scrollMargin,
  });

  const toggleExpand = React.useCallback((matchId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      return next;
    });
  }, []);

  const activeFilterCount =
    (queueFilter !== "all" ? 1 : 0) +
    (resultFilter !== "all" ? 1 : 0) +
    (sortOrder !== "newest" ? 1 : 0);

  const formattedError = error ? formatRiotError(error) : null;

  const queueSelect = (
    <Select<QueueFilterValue>
      items={QUEUE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
      value={queueFilter}
      onValueChange={(next) => {
        if (next) {
          setQueueFilter(next);
        }
      }}
    >
      <SelectTrigger
        aria-label="Queue filter"
        className={cn(
          "inline-flex h-8 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[8px] bg-panel px-3 text-[13px] font-medium text-fg select-none hairline",
          "transition-colors duration-150 hover:bg-control hover:hairline-strong",
        )}
      >
        <SelectValue>{selectedQueueOption.label}</SelectValue>
        <ChevronDownIcon className="h-3.5 w-3.5 text-meta-fg transition-transform duration-150 [[data-open]>&]:rotate-180" />
      </SelectTrigger>

      <SelectContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className={cn(
          "z-50 w-48 overflow-y-auto rounded-[10px] bg-popover p-1 text-[13px] text-fg hairline-strong",
          "shadow-[0_12px_32px_rgba(0,0,0,0.55)] outline-none",
        )}
      >
        {QUEUE_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            label={opt.label}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] select-none outline-none",
              "text-muted-fg transition-colors duration-100",
              "data-highlighted:bg-control-active data-highlighted:text-fg",
              "data-selected:text-fg",
            )}
          >
            <span>{opt.label}</span>
            <SelectItemIndicator className="text-fg">
              <CheckIcon className="h-3.5 w-3.5" />
            </SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const resultControl = (
    <SegmentedControl<ResultFilterValue>
      aria-label="Filter by result"
      value={resultFilter}
      onValueChange={setResultFilter}
      options={[
        {
          value: "all",
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-meta-fg" aria-hidden="true" />
              All
            </span>
          ),
        },
        {
          value: "wins",
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-win" aria-hidden="true" />
              Wins
            </span>
          ),
        },
        {
          value: "losses",
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-loss" aria-hidden="true" />
              Losses
            </span>
          ),
        },
      ]}
    />
  );

  const sortControl = (
    <SegmentedControl<SortOrderValue>
      aria-label="Sort matches"
      value={sortOrder}
      onValueChange={setSortOrder}
      options={[
        { value: "newest", label: "Newest" },
        { value: "oldest", label: "Oldest" },
      ]}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Band wired to live matches */}
      {isInitialLoading || (resolvedMatches.length === 0 && isAnyPending) ? (
        <SummaryBandSkeleton />
      ) : (
        <SummaryBand {...summaryData} />
      )}

      {/* Filter bar — desktop inline, 390px mobile sheet (Mobile Mandate #7) */}
      <div className="flex items-center justify-between gap-3 py-1">
        {/* Desktop controls */}
        <div className="hidden flex-wrap items-center gap-3 sm:flex">
          {queueSelect}
          <div className="h-5 w-px bg-[var(--hairline-color)]" aria-hidden="true" />
          {resultControl}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-[13px] text-meta-fg tabular">{resolvedMatches.length} loaded</span>
          {sortControl}
        </div>

        {/* Mobile 390px single Filter button + sheet */}
        <div className="flex w-full items-center justify-between gap-2 sm:hidden">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            className="h-9 gap-2"
          >
            <span>Filters</span>
            {activeFilterCount > 0 ? <Chip variant="count">{activeFilterCount}</Chip> : null}
          </Button>

          <span className="text-[13px] text-meta-fg tabular">
            {selectedQueueOption.label} · {resolvedMatches.length} loaded
          </span>
        </div>
      </div>

      {/* Mobile filter dialog sheet */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[4px]" />
        <DialogContent
          aria-label="Match filters"
          className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-5 rounded-[12px] bg-panel p-5 text-fg hairline-strong shadow-[0_24px_64px_rgba(0,0,0,0.65)] outline-none"
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[16px] font-semibold text-fg">Filters</DialogTitle>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] text-meta-fg hover:bg-control hover:text-fg"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-meta-fg">Queue</span>
              {queueSelect}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-meta-fg">Result</span>
              {resultControl}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-meta-fg">Sort</span>
              {sortControl}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 hairline-divider-t">
            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQueueFilter("all");
                  setResultFilter("all");
                  setSortOrder("newest");
                }}
              >
                Reset
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error alert if matchlist fails */}
      {formattedError ? (
        <div
          role="alert"
          className={cn(
            "flex items-center gap-2 rounded-[8px] bg-panel px-4 py-3 text-[13px] hairline-divider",
            formattedError.kind === "rate_limited" || formattedError.kind === "key_expired"
              ? "text-warning"
              : "text-loss",
          )}
        >
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{formattedError.message}</span>
        </div>
      ) : null}

      {/* Initial loading state */}
      {isInitialLoading ? (
        <div className="flex flex-col gap-2.5">
          <MatchRowSkeleton opacity={1} />
          <MatchRowSkeleton opacity={0.82} />
          <MatchRowSkeleton opacity={0.64} />
          <MatchRowSkeleton opacity={0.46} />
          <MatchRowSkeleton opacity={0.3} />
        </div>
      ) : virtualItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] bg-panel px-6 py-12 text-center hairline-divider">
          <span className="text-[16px] font-semibold text-fg">No matches found</span>
          <span className="text-[13px] text-meta-fg">
            {activeFilterCount > 0
              ? "Try clearing the active queue or result filter."
              : "No recent matches returned for this summoner."}
          </span>
          {activeFilterCount > 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => {
                setQueueFilter("all");
                setResultFilter("all");
                setSortOrder("newest");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        /* TanStack Virtual window-virtualized list */
        <div ref={listRef} className="w-full">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const item = virtualItems[virtualRow.index];
              if (!item) {
                return null;
              }

              return (
                <div
                  key={item.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                  }}
                >
                  {item.kind === "day" ? (
                    <div className="flex items-center justify-between pt-4 pb-2 text-[13px] first:pt-0">
                      <div className="flex items-center gap-2 tabular">
                        <span className="font-medium text-fg">{item.label}</span>
                        <span className="text-meta-fg">·</span>
                        <span className="text-meta-fg">
                          {item.wins}W {item.losses}L{item.remakes > 0 ? ` · ${item.remakes}R` : ""}
                        </span>
                      </div>
                    </div>
                  ) : item.kind === "match" ? (
                    <div className="pb-2.5">
                      <MatchRow
                        match={item.viewModel}
                        rawMatch={item.rawMatch}
                        version={lookups.version}
                        expanded={expandedIds.has(item.matchId)}
                        onToggle={() => toggleExpand(item.matchId)}
                        showMvpChip
                        goldTerminal
                      />
                    </div>
                  ) : (
                    <div className="pb-2.5">
                      <MatchRowSkeleton opacity={item.opacity} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Load more footer */}
      {!isInitialLoading && matchIds.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 pt-2">
          {hasMore ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              loading={isFetchingNextPage}
              onClick={() => setPageCount((prev) => prev + 1)}
              className="min-w-[160px]"
            >
              {isFetchingNextPage ? "Loading more" : "Load more"}
            </Button>
          ) : null}
          <span className="text-[13px] text-meta-fg tabular">
            Showing {resolvedMatches.length} of {matchIds.length} matches
          </span>
        </div>
      ) : null}
    </div>
  );
}
