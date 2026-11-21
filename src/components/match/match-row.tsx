import { useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { championSquare, itemIcon, runeIcon, spellIcon } from "../../lib/api/ddragon";
import type { MatchRowViewModel } from "../../lib/match/transform";
import type { MatchDTO } from "../../lib/riot/types";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { ChevronDownIcon } from "../ui/icons";
import { AssetImage } from "./asset-image";
import { MatchInsightStrip } from "./match-insight-strip";

export interface MatchRowProps {
  match: MatchRowViewModel;
  rawMatch?: MatchDTO;
  version: string;
  expanded: boolean;
  onToggle: () => void;
  /** Optional referrer context passed to /match/$matchId so back link + viewed player persist. */
  matchNavSearch?: { from: string; puuid: string };
  /** Allow MVP gold chip (Match History view's gold allowance). */
  showMvpChip?: boolean;
  /** Allow gold terminal dot in expanded mini chart. */
  goldTerminal?: boolean;
  className?: string;
}

/**
 * Full 1200px 8-lane match row on desktop and 390px 2-line card on mobile.
 * Clicking the row body navigates to /match/$matchId; clicking the 44px chevron lane
 * expands the 3-column insight strip without triggering navigation.
 */
export function MatchRow({
  match,
  rawMatch,
  version,
  expanded,
  onToggle,
  matchNavSearch,
  showMvpChip = true,
  goldTerminal = true,
  className,
}: MatchRowProps) {
  const navigate = useNavigate();

  const handleOpenMatch = React.useCallback(() => {
    void navigate({
      to: "/match/$matchId",
      params: { matchId: match.id },
      search: matchNavSearch ?? {},
    });
  }, [navigate, match.id, matchNavSearch]);

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenMatch();
    }
  };

  const outcomeLabel = match.isRemake ? "Remake" : match.win ? "Victory" : "Defeat";
  const outcomeColor = match.isRemake ? "text-muted-fg" : match.win ? "text-win" : "text-loss";
  const ledColor = match.isRemake ? "bg-border-strong" : match.win ? "bg-win" : "bg-loss";
  const washClass = match.isRemake ? "" : match.win ? "match-row-win" : "match-row-loss";

  const hasLp = match.lpDelta !== null;
  const lpText = hasLp
    ? match.lpDelta! > 0
      ? `+${match.lpDelta}`
      : `${match.lpDelta}`
    : match.goldEarnedLabel;
  const lpSub = hasLp ? "LP" : "Gold";

  const allyExtras = Math.max(0, match.allies.length - 1);
  const enemyExtras = Math.max(0, match.enemies.length - 1);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-panel hairline-divider transition-[border-color] duration-150 hover:hairline-strong",
        className,
      )}
    >
      {/* Left 3px win/loss/remake LED */}
      <div aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", ledColor)} />

      {/* DESKTOP 8-LANE ROW (144 / 116 / 136 / flex / 222 / 132 / 64 / 44) */}
      <div className={cn("hidden h-[92px] items-center lg:flex", washClass)}>
        <div
          role="link"
          tabIndex={0}
          onClick={handleOpenMatch}
          onKeyDown={handleRowKeyDown}
          aria-label={`${outcomeLabel} as ${match.championName}, ${match.kills}/${match.deaths}/${match.assists}, open match details`}
          className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-6 outline-none"
        >
          {/* Lane 1: Meta (144px incl. 20px left pad) */}
          <div className="flex w-[144px] shrink-0 flex-col justify-center gap-0.5 pl-5">
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[16px] leading-[1.25] font-semibold", outcomeColor)}>
                {outcomeLabel}
              </span>
              {showMvpChip && match.isMvp ? (
                <Chip variant="mvp" className="px-1.5 py-0 text-[13px] leading-[18px]">
                  MVP
                </Chip>
              ) : null}
            </div>
            <span className="truncate text-[13px] text-muted-fg">{match.queueName}</span>
            <span className="text-[13px] text-meta-fg tabular">
              {match.durationLabel} · {match.agoLabel}
            </span>
          </div>

          {/* Lane 2: Champion (116px: 56px portrait + 22px stacked spells + 22px runes) */}
          <div className="flex w-[116px] shrink-0 items-center gap-1.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] hairline-divider">
              <AssetImage
                src={championSquare(version, match.championId)}
                alt={match.championName}
                className="h-full w-full"
              />
              <span className="absolute right-0.5 bottom-0.5 rounded-[4px] bg-canvas/90 px-1 py-0 text-[13px] leading-[16px] font-semibold text-fg tabular">
                {match.level}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {match.spells.map((spellKey, idx) => (
                <AssetImage
                  key={`${match.id}-spell-${idx}`}
                  src={spellKey ? spellIcon(version, spellKey) : null}
                  alt={match.spellNames[idx] ?? "Spell"}
                  className="h-[22px] w-[22px] rounded-[4px] hairline"
                />
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-canvas/80 p-0.5 hairline">
                <AssetImage
                  src={match.keystoneIcon ? runeIcon(match.keystoneIcon) : null}
                  alt="Keystone rune"
                  className="h-full w-full rounded-full"
                />
              </div>
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-canvas/60 p-1 hairline">
                <AssetImage
                  src={match.secondaryRuneIcon ? runeIcon(match.secondaryRuneIcon) : null}
                  alt="Secondary rune tree"
                  className="h-full w-full rounded-full opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Lane 3: KDA (136px) */}
          <div className="flex w-[136px] shrink-0 flex-col justify-center gap-0.5 tabular">
            <div className="flex items-baseline gap-1.5 text-[20px] leading-[1.2] font-semibold tracking-[-0.02em]">
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
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-[13px] tabular">
            <div className="flex items-center justify-between gap-2">
              <span className="text-meta-fg">CS</span>
              <span className="text-fg">
                {match.cs} <span className="text-meta-fg">{match.csPerMinLabel}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-meta-fg">KP</span>
              <span className="text-fg">{match.kp}%</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-meta-fg">Vision</span>
              <span className="text-fg">{match.vision}</span>
            </div>
          </div>

          {/* Lane 5: Items (222px: 6x28 r4 gap 3 + 12px gutter + 28px round trinket) */}
          <div className="flex w-[222px] shrink-0 items-center">
            <div className="flex items-center gap-[3px]">
              {match.items.map((itemId, index) => (
                <AssetImage
                  key={`${match.id}-item-${index}`}
                  src={itemIcon(version, itemId)}
                  alt={itemId > 0 ? `Item ${itemId}` : "Empty slot"}
                  className="h-7 w-7 rounded-[4px] hairline"
                />
              ))}
            </div>
            <div className="w-3 shrink-0" />
            <AssetImage
              src={itemIcon(version, match.trinket)}
              alt="Trinket"
              className="h-7 w-7 rounded-full hairline"
            />
          </div>

          {/* Lane 6: Teams (132px: 32px lane opponent + vs Name + +4 / +4) */}
          <div className="flex w-[132px] shrink-0 items-center gap-2.5">
            <AssetImage
              src={match.opponentId ? championSquare(version, match.opponentId) : null}
              alt={match.opponentName ? `vs ${match.opponentName}` : "Opponent"}
              className="h-8 w-8 shrink-0 rounded-[6px] opacity-85 hairline"
            />
            <div className="flex min-w-0 flex-col gap-0.5 text-[13px]">
              <span className="truncate text-muted-fg">
                {match.opponentName ? `vs ${match.opponentName}` : "—"}
              </span>
              <div className="flex items-center gap-2 text-meta-fg tabular">
                <span className="text-fg">+{allyExtras}</span>
                <span className="opacity-55">+{enemyExtras}</span>
              </div>
            </div>
          </div>

          {/* Lane 7: LP / Gold (64px right-aligned, 24px gap before expand border) */}
          <div className="mr-6 flex w-[64px] shrink-0 flex-col items-end justify-center tabular">
            <span
              className={cn(
                "text-[16px] leading-[1.25] font-semibold",
                hasLp ? (match.lpDelta! < 0 ? "text-loss" : "text-win") : "text-fg",
              )}
            >
              {lpText}
            </span>
            <span className="text-[13px] text-meta-fg">{lpSub}</span>
          </div>
        </div>

        {/* Lane 8: Expand (44px tap target, flush right, left hairline divider) */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse match insights" : "Expand match insights"}
          className="flex h-full w-[44px] shrink-0 cursor-pointer items-center justify-center text-muted-fg/70 hairline-divider-l transition-colors duration-150 hover:bg-control/50 hover:text-fg active:bg-control"
        >
          <ChevronDownIcon
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 ease-out",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* MOBILE 390px 2-LINE VARIANT (Mobile Mandate #1) */}
      <div className={cn("flex flex-col gap-3 p-3.5 pl-4 lg:hidden", washClass)}>
        <div className="flex items-center justify-between gap-2">
          <div
            role="link"
            tabIndex={0}
            onClick={handleOpenMatch}
            onKeyDown={handleRowKeyDown}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 outline-none"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] hairline-divider">
              <AssetImage
                src={championSquare(version, match.championId)}
                alt={match.championName}
                className="h-full w-full"
              />
              <span className="absolute right-0.5 bottom-0.5 rounded-[3px] bg-canvas/90 px-1 text-[13px] leading-[15px] font-semibold text-fg tabular">
                {match.level}
              </span>
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5 text-[13px]">
                <span className={cn("font-semibold", outcomeColor)}>{outcomeLabel}</span>
                {showMvpChip && match.isMvp ? (
                  <Chip variant="mvp" className="px-1.5 py-0 text-[13px] leading-[17px]">
                    MVP
                  </Chip>
                ) : null}
                <span className="truncate text-meta-fg tabular">· {match.durationLabel}</span>
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

          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "text-[13px] font-semibold tabular",
                hasLp ? (match.lpDelta! < 0 ? "text-loss" : "text-win") : "text-muted-fg",
              )}
            >
              {hasLp ? `${lpText} LP` : lpText}
            </span>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse match insights" : "Expand match insights"}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] text-muted-fg/80 transition-colors hover:bg-control/50 hover:text-fg active:bg-control"
            >
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 transition-transform duration-200 ease-out",
                  expanded && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* Line 2: 7 item slots at 24px */}
        <div
          role="link"
          tabIndex={-1}
          onClick={handleOpenMatch}
          className="flex cursor-pointer items-center gap-1.5"
        >
          {match.items.map((itemId, index) => (
            <AssetImage
              key={`${match.id}-m-item-${index}`}
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

      {/* EXPANDED INSIGHT STRIP */}
      {expanded ? (
        <MatchInsightStrip
          match={match}
          rawMatch={rawMatch}
          version={version}
          matchNavSearch={matchNavSearch}
          goldTerminal={goldTerminal}
        />
      ) : null}
    </article>
  );
}
