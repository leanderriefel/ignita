import { Link } from "@tanstack/react-router";

import { championSquare, itemIcon, spellIcon } from "../../lib/api/ddragon";
import type { MatchRowViewModel } from "../../lib/match/transform";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";
import { AssetImage } from "./asset-image";

export interface MatchRowCompactProps {
  match: MatchRowViewModel;
  version: string;
  matchNavSearch?: { from: string; puuid: string };
  className?: string;
}

/**
 * Row/Compact named variant for the Dashboard (816px left column, 64px tall, gap 20, pad 16).
 * Preserves the exact column order of MatchRow:
 * meta (96) | champion (84) | kda (96) | stats (flex-1) | items (184) | lp/gold (52).
 * Zero gold accents.
 */
export function MatchRowCompact({
  match,
  version,
  matchNavSearch,
  className,
}: MatchRowCompactProps) {
  const outcomeLabel = match.isRemake ? "Remake" : match.win ? "Victory" : "Defeat";
  const outcomeColor = match.isRemake ? "text-muted-fg" : match.win ? "text-win" : "text-loss";
  const ledColor = match.isRemake ? "bg-border-strong" : match.win ? "bg-win" : "bg-loss";
  const washClass = match.isRemake ? "" : match.win ? "match-row-win" : "match-row-loss";

  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: match.id }}
      search={matchNavSearch ?? {}}
      className={cn(
        "group relative block overflow-hidden rounded-[8px] bg-panel hairline-divider transition-[border-color] duration-150 hover:hairline-strong",
        className,
      )}
    >
      <div aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", ledColor)} />

      {/* Desktop 6-lane compact row (816px budget) */}
      <div className={cn("hidden h-[64px] items-center gap-5 px-4 sm:flex", washClass)}>
        {/* Lane 1: Meta (96px) */}
        <div className="flex w-[96px] shrink-0 flex-col justify-center">
          <span className={cn("text-[13px] leading-[1.3] font-semibold", outcomeColor)}>
            {outcomeLabel}
          </span>
          <span className="truncate text-[13px] text-meta-fg tabular">
            {match.durationLabel} · {match.agoLabel}
          </span>
        </div>

        {/* Lane 2: Champion (84px: 36px portrait + stacked 16px spells) */}
        <div className="flex w-[84px] shrink-0 items-center gap-1.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[6px] hairline-divider">
            <AssetImage
              src={championSquare(version, match.championId)}
              alt={match.championName}
              className="h-full w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            {match.spells.map((spellKey, idx) => (
              <AssetImage
                key={`${match.id}-c-spell-${idx}`}
                src={spellKey ? spellIcon(version, spellKey) : null}
                alt={match.spellNames[idx] ?? "Spell"}
                className="h-4 w-4 rounded-[3px] hairline"
              />
            ))}
          </div>
        </div>

        {/* Lane 3: KDA (96px) */}
        <div className="flex w-[96px] shrink-0 flex-col justify-center tabular">
          <div className="flex items-baseline gap-1 text-[16px] leading-[1.2] font-semibold tracking-[-0.02em]">
            <span className="text-fg">{match.kills}</span>
            <span className="font-normal text-border-strong">/</span>
            <span className={match.win || match.isRemake ? "text-fg" : "text-loss"}>
              {match.deaths}
            </span>
            <span className="font-normal text-border-strong">/</span>
            <span className="text-fg">{match.assists}</span>
          </div>
          <span className="text-[13px] text-meta-fg">{match.kdaRatio} KDA</span>
        </div>

        {/* Lane 4: Stats (flex-1 absorber) */}
        <div className="hidden min-w-0 flex-1 flex-col justify-center text-[13px] tabular md:flex">
          <span className="truncate text-fg">
            {match.cs} CS <span className="text-meta-fg">{match.csPerMinLabel}</span>
          </span>
          <span className="truncate text-meta-fg">{match.kp}% KP</span>
        </div>

        {/* Lane 5: Items (184px: 6x24 r4 gap 2 + 8px gap + 24px trinket) */}
        <div className="flex w-[184px] shrink-0 items-center">
          <div className="flex items-center gap-[2px]">
            {match.items.map((itemId, index) => (
              <AssetImage
                key={`${match.id}-c-item-${index}`}
                src={itemIcon(version, itemId)}
                alt={itemId > 0 ? `Item ${itemId}` : "Empty slot"}
                className="h-6 w-6 rounded-[4px] hairline"
              />
            ))}
          </div>
          <div className="w-2 shrink-0" />
          <AssetImage
            src={itemIcon(version, match.trinket)}
            alt="Trinket"
            className="h-6 w-6 rounded-full hairline"
          />
        </div>

        {/* Lane 6: Gold / metric (52px right-aligned) */}
        <div className="flex w-[52px] shrink-0 flex-col items-end justify-center tabular">
          <span className="text-[13px] font-semibold text-fg">{match.goldEarnedLabel}</span>
          <span className="text-[13px] text-meta-fg">Gold</span>
        </div>
      </div>

      {/* Mobile 390px compact 2-line variant */}
      <div className={cn("flex flex-col gap-2.5 p-3 pl-4 sm:hidden", washClass)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <AssetImage
              src={championSquare(version, match.championId)}
              alt={match.championName}
              className="h-9 w-9 shrink-0 rounded-[6px] hairline-divider"
            />
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5 text-[13px]">
                <span className={cn("font-semibold", outcomeColor)}>{outcomeLabel}</span>
                <span className="truncate text-meta-fg tabular">
                  · {match.durationLabel} · {match.agoLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-[16px] leading-[1.2] font-semibold tabular">
                <span className="text-fg">{match.kills}</span>
                <span className="font-normal text-border-strong">/</span>
                <span className={match.win || match.isRemake ? "text-fg" : "text-loss"}>
                  {match.deaths}
                </span>
                <span className="font-normal text-border-strong">/</span>
                <span className="text-fg">{match.assists}</span>
                <span className="ml-1 text-[13px] font-normal text-meta-fg">{match.kdaRatio}</span>
              </div>
            </div>
          </div>

          <span
            aria-label={`Gold earned ${match.goldEarnedLabel}`}
            className="shrink-0 text-[16px] leading-[1.2] font-semibold text-fg tabular"
          >
            {match.goldEarnedLabel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {match.items.map((itemId, index) => (
            <AssetImage
              key={`${match.id}-cm-item-${index}`}
              src={itemIcon(version, itemId)}
              alt={itemId > 0 ? `Item ${itemId}` : "Empty slot"}
              className="h-6 w-6 rounded-[4px] hairline"
            />
          ))}
          <div className="w-1 shrink-0" />
          <AssetImage
            src={itemIcon(version, match.trinket)}
            alt="Trinket"
            className="h-6 w-6 rounded-full hairline"
          />
        </div>
      </div>
    </Link>
  );
}

/** Exact lane clone skeleton for MatchRowCompact. */
export function MatchRowCompactSkeleton({
  opacity = 1,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ opacity }}
      className={cn("overflow-hidden rounded-[8px] bg-panel hairline-divider", className)}
    >
      <div className="hidden h-[64px] items-center gap-5 px-4 sm:flex">
        <div className="flex w-[96px] shrink-0 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3 w-20 opacity-60" />
        </div>
        <div className="flex w-[84px] shrink-0 items-center gap-1.5">
          <Skeleton rounded="sm" className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton rounded="slot" className="h-4 w-4" />
            <Skeleton rounded="slot" className="h-4 w-4" />
          </div>
        </div>
        <div className="flex w-[96px] shrink-0 flex-col gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-14 opacity-60" />
        </div>
        <div className="hidden min-w-0 flex-1 flex-col gap-1.5 md:flex">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14 opacity-60" />
        </div>
        <div className="flex w-[184px] shrink-0 items-center">
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} rounded="slot" className="h-6 w-6" />
            ))}
          </div>
          <div className="w-2 shrink-0" />
          <Skeleton rounded="full" className="h-6 w-6" />
        </div>
        <div className="flex w-[52px] shrink-0 flex-col items-end gap-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3 w-7 opacity-55" />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton rounded="sm" className="h-9 w-9 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-4 w-24 opacity-70" />
            </div>
          </div>
          <Skeleton className="h-3 w-10 opacity-60" />
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} rounded="slot" className="h-6 w-6" />
          ))}
          <div className="w-1 shrink-0" />
          <Skeleton rounded="full" className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
