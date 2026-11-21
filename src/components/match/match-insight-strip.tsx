import { Link } from "@tanstack/react-router";

import { championSquare } from "../../lib/api/ddragon";
import { useTimeline } from "../../lib/api/queries";
import {
  computeTimelineInsight,
  formatCompactNumber,
  type MatchRowViewModel,
} from "../../lib/match/transform";
import type { MatchDTO } from "../../lib/riot/types";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { ArrowRightIcon } from "../ui/icons";
import { Skeleton } from "../ui/skeleton";
import { AssetImage } from "./asset-image";
import { MiniGoldChart } from "./mini-gold-chart";

export interface MatchInsightStripProps {
  match: MatchRowViewModel;
  rawMatch?: MatchDTO;
  version: string;
  matchNavSearch?: { from: string; puuid: string };
  /** Whether the chart terminal dot may use gold (true on Match History tab). */
  goldTerminal?: boolean;
}

function formatSignedNumber(value: number): string {
  const formatted = Math.abs(value).toLocaleString("en-US");
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return "±0";
}

function signedTone(value: number): string {
  if (value > 0) {
    return "text-win";
  }
  if (value < 0) {
    return "text-loss";
  }
  return "text-fg";
}

/**
 * Expanded 3-column insight strip below a MatchRow, plus the compact 5v5 team comp.
 * Lazily fetches match timeline only when mounted (expanded) and falls back honestly
 * to match-end team gold & kill totals if timeline data is unavailable.
 */
export function MatchInsightStrip({
  match,
  rawMatch,
  version,
  matchNavSearch,
  goldTerminal = true,
}: MatchInsightStripProps) {
  const timelineQuery = useTimeline(match.id, Boolean(rawMatch) && !match.isRemake);
  const timelineInsight =
    rawMatch && timelineQuery.data
      ? computeTimelineInsight(
          timelineQuery.data,
          rawMatch,
          match.playerTeamId,
          match.playerParticipantId,
          match.opponentParticipantId,
        )
      : null;

  const teamGoldDiff = match.teamGold - match.enemyGold;
  const teamGoldDiffLabel = `${teamGoldDiff > 0 ? "+" : teamGoldDiff < 0 ? "-" : ""}${formatCompactNumber(Math.abs(teamGoldDiff))}`;
  const totalTeamGold = Math.max(1, match.teamGold + match.enemyGold);
  const allyGoldPct = Math.round((match.teamGold / totalTeamGold) * 100);

  return (
    <div className="bg-section/90 hairline-divider-t">
      {/* 3-column insight grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Column 1: Highlights & lane/game facts */}
        <div className="flex flex-col justify-between gap-4 p-5 max-lg:hairline-divider-b lg:hairline-divider-r">
          <div>
            <div className="mb-2.5 text-[13px] font-medium text-meta-fg">Highlights</div>
            <div className="flex flex-wrap gap-1.5">
              {match.highlights.map((tag) => (
                <Chip key={tag} variant="neutral">
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 tabular">
            {timelineInsight && timelineInsight.csDiff15 !== null ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-meta-fg">CS diff @15</span>
                <span
                  className={cn("text-[16px] font-semibold", signedTone(timelineInsight.csDiff15))}
                >
                  {formatSignedNumber(timelineInsight.csDiff15)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-meta-fg">Gold / min</span>
                <span className="text-[16px] font-semibold text-fg">{match.goldPerMin}</span>
              </div>
            )}

            {timelineInsight && timelineInsight.goldDiff15 !== null ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-meta-fg">Gold diff @15</span>
                <span
                  className={cn(
                    "text-[16px] font-semibold",
                    signedTone(timelineInsight.goldDiff15),
                  )}
                >
                  {formatSignedNumber(timelineInsight.goldDiff15)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-meta-fg">Dmg / min</span>
                <span className="text-[16px] font-semibold text-fg">{match.damagePerMin}</span>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-meta-fg">Gold</span>
              <span className="text-[16px] font-semibold text-fg">{match.goldEarnedLabel}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Team gold advantage (real timeline when available, honest fallback otherwise) */}
        <div className="flex flex-col justify-between gap-3 p-5 max-lg:hairline-divider-b lg:hairline-divider-r">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-meta-fg">Team gold advantage</span>
            <span className="text-[13px] tabular">
              <span
                className={cn(
                  "font-semibold",
                  signedTone(timelineInsight ? timelineInsight.finalLeadK : teamGoldDiff),
                )}
              >
                {timelineInsight ? timelineInsight.finalLeadLabel : teamGoldDiffLabel}
              </span>{" "}
              <span className="text-meta-fg">at {match.durationLabel}</span>
            </span>
          </div>

          {timelineQuery.isPending && rawMatch && !match.isRemake ? (
            <Skeleton rounded="sm" className="h-[74px] w-full opacity-70" />
          ) : timelineInsight ? (
            <>
              <MiniGoldChart curve={timelineInsight.curve} goldTerminal={goldTerminal} />
              <div className="flex items-center justify-between text-[13px] text-meta-fg tabular">
                <span>0m</span>
                <span>{Math.round(timelineInsight.durationMin / 2)}m</span>
                <span>{timelineInsight.durationMin}m</span>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center gap-3 py-2 tabular">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-fg font-medium">
                  Ally {formatCompactNumber(match.teamGold)}
                </span>
                <span className="text-meta-fg">
                  {match.teamKills} : {match.enemyKills}
                </span>
                <span className="text-muted-fg">Enemy {formatCompactNumber(match.enemyGold)}</span>
              </div>
              <div className="flex h-1.5 w-full gap-[2px] overflow-hidden rounded-[2px] bg-control">
                <div style={{ width: `${allyGoldPct}%` }} className="h-full bg-team-blue/80" />
                <div style={{ width: `${100 - allyGoldPct}%` }} className="h-full bg-team-red/80" />
              </div>
              <span className="text-[13px] text-meta-fg">Timeline unavailable</span>
            </div>
          )}
        </div>

        {/* Column 3: Damage breakdown (94% / 62% / 40% neutral greys) */}
        <div className="flex flex-col justify-between gap-3 p-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-meta-fg">Damage to champions</span>
            <span className="text-[13px] text-meta-fg tabular">#{match.damageRank} of 10</span>
          </div>

          <div>
            <div className="flex items-baseline gap-2 tabular">
              <span className="text-[20px] font-semibold tracking-[-0.02em] text-fg">
                {match.damageTotalLabel}
              </span>
              <span className="text-[13px] text-meta-fg">{match.damageSharePct}% of team</span>
            </div>

            {/* Flat neutral-grey segmented bar with 2px gaps (spec rule #7) */}
            <div className="mt-2.5 flex h-1.5 w-full gap-[2px] overflow-hidden rounded-[2px]">
              {match.damageSplit.physical > 0 ? (
                <div
                  style={{ width: `${match.damageSplit.physical}%` }}
                  className="h-full bg-dmg-physical"
                />
              ) : null}
              {match.damageSplit.magic > 0 ? (
                <div
                  style={{ width: `${match.damageSplit.magic}%` }}
                  className="h-full bg-dmg-magic"
                />
              ) : null}
              {match.damageSplit.trueDmg > 0 ? (
                <div
                  style={{ width: `${match.damageSplit.trueDmg}%` }}
                  className="h-full bg-dmg-true"
                />
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-meta-fg tabular">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-dmg-physical" aria-hidden="true" />
                Phys <span className="text-fg">{match.damageSplit.physical}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-dmg-magic" aria-hidden="true" />
                Magic <span className="text-fg">{match.damageSplit.magic}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-dmg-true" aria-hidden="true" />
                True <span className="text-fg">{match.damageSplit.trueDmg}%</span>
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              to="/match/$matchId"
              params={{ matchId: match.id }}
              search={matchNavSearch ?? {}}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg transition-opacity duration-150 hover:opacity-80"
            >
              <span>Open full match</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Compact 5v5 team composition strip (moved into expansion per spec) */}
      {match.allies.length > 0 || match.enemies.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 px-5 py-3 hairline-divider-t lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-meta-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-team-blue" aria-hidden="true" />
              Ally
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {match.allies.map((member) => (
                <span
                  key={member.puuid}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-[13px]",
                    member.isViewedPlayer ? "bg-control text-fg" : "text-muted-fg",
                  )}
                >
                  <AssetImage
                    src={championSquare(version, member.championId)}
                    alt={member.championName}
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-[4px]",
                      member.isViewedPlayer ? "ring-[1.5px] ring-fg" : "hairline",
                    )}
                  />
                  <span className="max-w-[84px] truncate">{member.summonerName}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-meta-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-team-red" aria-hidden="true" />
              Enemy
            </span>
            <div className="flex flex-wrap items-center gap-2 opacity-80">
              {match.enemies.map((member) => (
                <span
                  key={member.puuid}
                  className="inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-[13px] text-meta-fg"
                >
                  <AssetImage
                    src={championSquare(version, member.championId)}
                    alt={member.championName}
                    className="h-5 w-5 shrink-0 rounded-[4px] hairline"
                  />
                  <span className="max-w-[84px] truncate">{member.summonerName}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
