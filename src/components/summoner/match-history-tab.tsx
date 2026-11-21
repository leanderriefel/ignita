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
import {
  MATCH_HISTORY_PAGE_SIZE,
  useInfiniteMatchHistoryIds,
  useMatches,
} from "../../lib/match/use-matches";
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

/** Exact rendered row heights (MatchRow + pb-2.5 10px bottom spacing). */
const DESKTOP_ROW_HEIGHT = 102;
const MOBILE_ROW_HEIGHT = 118;
const DAY_HEADER_FIRST_HEIGHT = 26;
const DAY_HEADER_HEIGHT = 42;
const DESKTOP_EXPANDED_HEIGHT = 392;
const MOBILE_EXPANDED_HEIGHT = 560;
const VIRTUAL_OVERSCAN = 10;

type VirtualItem =
  | {
      kind: "day";
      key: string;
      label: string;
      wins: number;
      losses: number;
      remakes: number;
      isFirst: boolean;
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
  matchNavSearch?: { from: string; puuid: string };
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
 * - Visibility-aware TanStack Window Virtualizer with stable item keys, dynamic
 *   measurement, accurate document scrollMargin tracking, and in-place skeleton hydration
 * - True infinite scroll via useInfiniteQuery + IntersectionObserver sentinel
 * - Viewport-windowed progressive body hydration
 */
export function MatchHistoryTab({
  platform,
  puuid,
  matchNavSearch,
  lookups,
}: MatchHistoryTabProps) {
  const [queueFilter, setQueueFilter] = React.useState<QueueFilterValue>("all");
  const [resultFilter, setResultFilter] = React.useState<ResultFilterValue>("all");
  const [sortOrder, setSortOrder] = React.useState<SortOrderValue>("newest");
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => new Set());
  const [requestedIds, setRequestedIds] = React.useState<Set<string>>(() => new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // @ui-sdk TabsPanel keeps inactive panels mounted with `hidden` (display: none).
  // Track actual visibility so the virtualizer never measures 0-height hidden nodes
  // and infinite-scroll / body fetches stay idle while the user is on Overview.
  const [isPanelVisible, setIsPanelVisible] = React.useState(false);
  const [scrollMargin, setScrollMargin] = React.useState(0);
  const [isDesktop, setIsDesktop] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    const checkVisibility = () => {
      const visible = el.getBoundingClientRect().width > 0;
      setIsPanelVisible((prev) => (prev === visible ? prev : visible));
    };
    checkVisibility();

    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const ro = new ResizeObserver(checkVisibility);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectedQueueOption =
    QUEUE_OPTIONS.find((opt) => opt.value === queueFilter) ?? QUEUE_OPTIONS[0]!;

  // Reset UI expansion & hydration latch when queue filter or summoner changes
  React.useEffect(() => {
    setExpandedIds(new Set());
    setRequestedIds(new Set());
  }, [queueFilter, puuid, platform]);

  const {
    matchIds,
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
    isFetchNextPageError,
    fetchNextPage,
    error,
  } = useInfiniteMatchHistoryIds(platform, puuid, selectedQueueOption.queueId, isPanelVisible);

  // Prioritize hydrating the first page (SummaryBand + above-the-fold) plus rows near
  // the virtualizer's rendered window. Filtering or oldest-first sorting needs all loaded IDs.
  const activeFetchIds = React.useMemo<ReadonlySet<string>>(() => {
    if (!isPanelVisible || matchIds.length === 0) {
      return new Set<string>();
    }
    if (resultFilter !== "all" || sortOrder === "oldest") {
      return new Set<string>(matchIds);
    }
    const next = new Set<string>(requestedIds);
    const initialCount = Math.min(MATCH_HISTORY_PAGE_SIZE, matchIds.length);
    for (let i = 0; i < initialCount; i += 1) {
      const id = matchIds[i];
      if (id) {
        next.add(id);
      }
    }
    return next;
  }, [isPanelVisible, matchIds, resultFilter, sortOrder, requestedIds]);

  const { byId, resolvedMatches, isAnyPending } = useMatches(matchIds, {
    activeIds: activeFetchIds,
  });

  // SummaryBand computes from the latest 20 match IDs, with deltas vs prior 20 when cached/loaded
  const summaryData = React.useMemo(() => {
    const recent: MatchDTO[] = [];
    for (const id of matchIds.slice(0, 20)) {
      const data = byId.get(id)?.data;
      if (data) {
        recent.push(data);
      }
    }
    const prior: MatchDTO[] = [];
    for (const id of matchIds.slice(20, 40)) {
      const data = byId.get(id)?.data;
      if (data) {
        prior.push(data);
      }
    }
    return computeSummaryBandData(recent, prior, puuid);
  }, [matchIds, byId, puuid]);

  // Build ordered view models + day headers for the virtualized list.
  // In the default newest-first unfiltered view, Riot returns matchIds newest-first,
  // so skeletons stay IN PLACE at each match ID's slot and hydrate with zero reflow.
  const { virtualItems, filteredMatchCount } = React.useMemo<{
    virtualItems: VirtualItem[];
    filteredMatchCount: number;
  }>(() => {
    if (resultFilter === "all" && sortOrder === "newest") {
      const out: VirtualItem[] = [];
      let currentDayKey: string | null = null;
      let currentDayHeaderIndex = -1;
      let skeletonIdx = 0;
      let matchCount = 0;

      for (const id of matchIds) {
        const state = byId.get(id);
        if (state?.data) {
          const vm = buildMatchRowViewModel(state.data, puuid, lookups);
          if (!vm) {
            continue;
          }
          if (vm.dayKey !== currentDayKey) {
            currentDayKey = vm.dayKey;
            currentDayHeaderIndex = out.length;
            out.push({
              kind: "day",
              key: `day-${vm.dayKey}-${currentDayHeaderIndex}`,
              label: vm.dayLabel,
              wins: 0,
              losses: 0,
              remakes: 0,
              isFirst: currentDayHeaderIndex === 0,
            });
          }

          const header = out[currentDayHeaderIndex];
          if (header && header.kind === "day") {
            if (vm.isRemake) {
              header.remakes += 1;
            } else if (vm.win) {
              header.wins += 1;
            } else {
              header.losses += 1;
            }
          }

          out.push({
            kind: "match",
            key: `match-${id}`,
            matchId: id,
            viewModel: vm,
            rawMatch: state.data,
          });
          matchCount += 1;
        } else if (!state?.isError) {
          out.push({
            kind: "skeleton",
            key: `match-${id}`,
            matchId: id,
            opacity: Math.max(0.45, 1 - skeletonIdx * 0.06),
          });
          skeletonIdx += 1;
        }
      }

      return { virtualItems: out, filteredMatchCount: matchCount };
    }

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
          isFirst: currentDayHeaderIndex === 0,
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
        key: `match-${viewModel.id}`,
        matchId: viewModel.id,
        viewModel,
        rawMatch,
      });
    }

    if (resultFilter === "all") {
      pendingIds.forEach((id, idx) => {
        out.push({
          kind: "skeleton",
          key: `match-${id}`,
          matchId: id,
          opacity: Math.max(0.45, 1 - idx * 0.06),
        });
      });
    }

    return { virtualItems: out, filteredMatchCount: sorted.length };
  }, [matchIds, byId, puuid, lookups, resultFilter, sortOrder]);

  // Measure the true document Y offset of `listRef` whenever the panel becomes visible
  // or anything above the list changes height (ProfileHero, LiveBanner, SummaryBand, errors).
  const updateScrollMargin = React.useCallback(() => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const next = Math.max(0, Math.round(rect.top + window.scrollY));
    setScrollMargin((prev) => (prev === next ? prev : next));
  }, []);

  const hasError = Boolean(error);
  const hasResolvedSummary = resolvedMatches.length > 0;

  React.useLayoutEffect(() => {
    if (!isPanelVisible) {
      return;
    }
    updateScrollMargin();
    const rafId = window.requestAnimationFrame(updateScrollMargin);
    // Re-check once after motion.main entrance transform (220ms) finishes settling
    const settleTimer = window.setTimeout(updateScrollMargin, 280);

    window.addEventListener("resize", updateScrollMargin);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateScrollMargin);
      ro.observe(document.body);
      if (rootRef.current) {
        ro.observe(rootRef.current);
      }
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateScrollMargin);
      ro?.disconnect();
    };
  }, [isPanelVisible, isInitialLoading, hasError, hasResolvedSummary, updateScrollMargin]);

  const virtualizerEnabled = isPanelVisible && !isInitialLoading && virtualItems.length > 0;

  const virtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    enabled: virtualizerEnabled,
    getItemKey: (index) => virtualItems[index]?.key ?? index,
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (!item) {
        return isDesktop ? DESKTOP_ROW_HEIGHT : MOBILE_ROW_HEIGHT;
      }
      if (item.kind === "day") {
        return item.isFirst ? DAY_HEADER_FIRST_HEIGHT : DAY_HEADER_HEIGHT;
      }
      if (item.kind === "match" && expandedIds.has(item.matchId)) {
        return isDesktop ? DESKTOP_EXPANDED_HEIGHT : MOBILE_EXPANDED_HEIGHT;
      }
      return isDesktop ? DESKTOP_ROW_HEIGHT : MOBILE_ROW_HEIGHT;
    },
    overscan: VIRTUAL_OVERSCAN,
    scrollMargin,
    initialRect:
      typeof window !== "undefined"
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 1200, height: 900 },
  });

  // Re-measure cached row sizes cleanly when crossing the desktop/mobile breakpoint
  const prevIsDesktopRef = React.useRef(isDesktop);
  React.useEffect(() => {
    if (prevIsDesktopRef.current !== isDesktop) {
      prevIsDesktopRef.current = isDesktop;
      if (virtualizerEnabled) {
        virtualizer.measure();
      }
    }
  }, [isDesktop, virtualizerEnabled, virtualizer]);

  const virtualRows = virtualizerEnabled ? virtualizer.getVirtualItems() : [];
  const firstVirtualIndex = virtualRows[0]?.index ?? 0;
  const lastVirtualIndex = virtualRows[virtualRows.length - 1]?.index ?? -1;

  // Tie progressive body hydration to the virtualizer's rendered window (+ small lookahead)
  React.useEffect(() => {
    if (
      !isPanelVisible ||
      resultFilter !== "all" ||
      sortOrder !== "newest" ||
      lastVirtualIndex < 0
    ) {
      return;
    }

    const start = Math.max(0, firstVirtualIndex - 4);
    const end = Math.min(virtualItems.length - 1, lastVirtualIndex + 12);
    const needed: string[] = [];

    for (let i = start; i <= end; i += 1) {
      const item = virtualItems[i];
      if (item && (item.kind === "skeleton" || item.kind === "match")) {
        needed.push(item.matchId);
      }
    }

    if (needed.length === 0) {
      return;
    }

    setRequestedIds((prev) => {
      let changed = false;
      for (const id of needed) {
        if (!prev.has(id)) {
          changed = true;
          break;
        }
      }
      if (!changed) {
        return prev;
      }
      const next = new Set(prev);
      for (const id of needed) {
        next.add(id);
      }
      return next;
    });
  }, [isPanelVisible, resultFilter, sortOrder, firstVirtualIndex, lastVirtualIndex, virtualItems]);

  // Infinite scroll sentinel — automatically fetches the next 20 match IDs near list bottom
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !isPanelVisible ||
      isInitialLoading ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    ) {
      return;
    }

    // Avoid chaining empty pages while a wins/losses filter is waiting for bodies to hydrate
    if (
      resultFilter !== "all" &&
      matchIds.length > 0 &&
      resolvedMatches.length === 0 &&
      isAnyPending
    ) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "0px 0px 400px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    isPanelVisible,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    matchIds.length,
    resultFilter,
    resolvedMatches.length,
    isAnyPending,
  ]);

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
  const displayedCount = resultFilter === "all" ? matchIds.length : filteredMatchCount;
  const isWaitingForFilteredBodies =
    resultFilter !== "all" && matchIds.length > 0 && filteredMatchCount === 0 && isAnyPending;

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
    <div ref={rootRef} className="flex flex-col gap-6">
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
          {displayedCount > 0 ? (
            <span className="text-[13px] text-meta-fg tabular">
              {displayedCount} {displayedCount === 1 ? "match" : "matches"}
            </span>
          ) : null}
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
            {selectedQueueOption.label}
            {displayedCount > 0
              ? ` · ${displayedCount} ${displayedCount === 1 ? "match" : "matches"}`
              : ""}
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
            "flex items-center justify-between gap-3 rounded-[8px] bg-panel px-4 py-3 text-[13px] hairline-divider",
            formattedError.kind === "rate_limited" || formattedError.kind === "key_expired"
              ? "text-warning"
              : "text-loss",
          )}
        >
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <span>{formattedError.message}</span>
          </div>
          {isFetchNextPageError ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void fetchNextPage()}
            >
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Persistent list anchor so scrollMargin always tracks the real document Y offset */}
      <div ref={listRef} className="w-full">
        {isInitialLoading || isWaitingForFilteredBodies ? (
          <div className="flex flex-col gap-2.5">
            <MatchRowSkeleton opacity={1} className="max-lg:min-h-[108px]" />
            <MatchRowSkeleton opacity={0.84} className="max-lg:min-h-[108px]" />
            <MatchRowSkeleton opacity={0.68} className="max-lg:min-h-[108px]" />
            <MatchRowSkeleton opacity={0.52} className="max-lg:min-h-[108px]" />
            <MatchRowSkeleton opacity={0.36} className="max-lg:min-h-[108px]" />
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
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualRows.map((virtualRow) => {
              const item = virtualItems[virtualRow.index];
              if (!item) {
                return null;
              }

              return (
                <div
                  key={virtualRow.key}
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
                    <div
                      className={cn(
                        "flex items-center justify-between pb-2 text-[13px]",
                        item.isFirst ? "pt-0" : "pt-4",
                      )}
                    >
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
                        matchNavSearch={matchNavSearch}
                        showMvpChip
                        goldTerminal
                      />
                    </div>
                  ) : (
                    <div className="pb-2.5">
                      <MatchRowSkeleton opacity={item.opacity} className="max-lg:min-h-[108px]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite-scroll trailing loading skeleton row(s) — exact lane anatomy */}
        {isFetchingNextPage ? (
          <div role="status" aria-live="polite" className="flex flex-col gap-2.5">
            <span className="sr-only">Loading more matches</span>
            <MatchRowSkeleton opacity={0.85} className="max-lg:min-h-[108px]" />
            <MatchRowSkeleton opacity={0.5} className="max-lg:min-h-[108px]" />
          </div>
        ) : null}

        {/* IntersectionObserver sentinel for automatic deep-history pagination */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </div>
  );
}
