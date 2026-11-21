import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as React from "react";

import { championSquare, itemIcon } from "../../lib/api/ddragon";
import type {
  ResolvedItem,
  ScoreboardParticipant,
  ScoreboardTeam,
  TeamSide,
} from "../../lib/match/detail";
import type { Platform } from "../../lib/riot/regions";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { ROLE_LABELS, RoleIcon } from "../ui/role-icons";
import { SegmentedControl } from "../ui/segmented-control";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AssetImage } from "./asset-image";

export interface MatchScoreboardProps {
  blueTeam: ScoreboardTeam;
  redTeam: ScoreboardTeam;
  platform: Platform | null;
  version: string;
  className?: string;
}

function ScoreboardItemSlot({
  item,
  version,
  size = "desktop",
  trinket = false,
}: {
  item: ResolvedItem;
  version: string;
  size?: "desktop" | "mobile";
  trinket?: boolean;
}) {
  const src = itemIcon(version, item.id);
  const dim = size === "mobile" ? "h-7 w-7" : "h-[22px] w-[22px]";
  const shape = trinket ? "rounded-full" : "rounded-[4px]";

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "shrink-0 bg-empty-slot border-[0.5px] border-empty-slot-border/80",
          dim,
          shape,
        )}
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={item.name ?? `Item ${item.id}`}
        render={
          <div
            tabIndex={0}
            className={cn("shrink-0 overflow-hidden outline-none hairline", dim, shape)}
          />
        }
      >
        <AssetImage src={src} alt={item.name ?? `Item ${item.id}`} className="h-full w-full" />
      </TooltipTrigger>
      <TooltipContent>
        <span>{item.name ?? `Item ${item.id}`}</span>
        {item.goldTotal ? (
          <span className="text-meta-fg tabular">{item.goldTotal.toLocaleString("en-US")}g</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

function DamageBar({
  participant,
  widthClass = "w-[120px]",
}: {
  participant: ScoreboardParticipant;
  widthClass?: string;
}) {
  const fillWidth = `${participant.damageBarPct}%`;
  return (
    <div
      aria-hidden="true"
      className={cn("h-1 overflow-hidden rounded-[2px] bg-control", widthClass)}
    >
      <div style={{ width: fillWidth }} className="flex h-full gap-[1px]">
        {participant.damageSplit.physical > 0 ? (
          <div
            style={{ width: `${participant.damageSplit.physical}%` }}
            className="h-full bg-dmg-physical"
          />
        ) : null}
        {participant.damageSplit.magic > 0 ? (
          <div
            style={{ width: `${participant.damageSplit.magic}%` }}
            className="h-full bg-dmg-magic"
          />
        ) : null}
        {participant.damageSplit.trueDmg > 0 ? (
          <div
            style={{ width: `${participant.damageSplit.trueDmg}%` }}
            className="h-full bg-dmg-true"
          />
        ) : null}
      </div>
    </div>
  );
}

function TeamResultChip({ team }: { team: ScoreboardTeam }) {
  if (team.isRemake) {
    return <Chip variant="neutral">Remake</Chip>;
  }
  return team.win ? <Chip variant="victory">Victory</Chip> : <Chip variant="defeat">Defeat</Chip>;
}

function PlayerNameCell({
  participant,
  platform,
}: {
  participant: ScoreboardParticipant;
  platform: Platform | null;
}) {
  const nameClass = participant.isViewedPlayer
    ? "font-semibold text-white"
    : "font-medium text-fg/90";

  if (participant.canLinkProfile && platform && participant.tagLine) {
    return (
      <Link
        to="/summoner/$platform/$name/$tag"
        params={{
          platform,
          name: participant.displayName,
          tag: participant.tagLine,
        }}
        className="group/player flex min-w-0 items-baseline gap-1 outline-none"
      >
        <span className={cn("truncate text-[13px] group-hover/player:underline", nameClass)}>
          {participant.displayName}
        </span>
        <span className="shrink-0 text-[13px] text-meta-fg">#{participant.tagLine}</span>
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-baseline gap-1">
      <span className={cn("truncate text-[13px]", nameClass)}>{participant.displayName}</span>
      {participant.tagLine ? (
        <span className="shrink-0 text-[13px] text-meta-fg">#{participant.tagLine}</span>
      ) : null}
    </div>
  );
}

function DesktopTeamTable({
  team,
  platform,
  version,
  rowIndexOffset,
}: {
  team: ScoreboardTeam;
  platform: Platform | null;
  version: string;
  rowIndexOffset: number;
}) {
  return (
    <section
      aria-label={team.label}
      className="overflow-hidden rounded-[12px] bg-panel hairline-divider"
    >
      {/* Team header (56px tall, padding 0 20) */}
      <div className="flex h-[56px] items-center justify-between gap-4 px-5 hairline-divider-b">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              team.side === "blue" ? "bg-team-blue" : "bg-team-red",
            )}
            aria-hidden="true"
          />
          <h2 className="text-[16px] leading-none font-semibold text-fg">{team.label}</h2>
          <TeamResultChip team={team} />
        </div>

        <div className="flex items-center gap-3 text-[13px] text-meta-fg tabular">
          <span>
            <span className="font-semibold text-fg">{team.totalKills}</span> kills
          </span>
          <span aria-hidden="true" className="text-border-strong">
            ·
          </span>
          <span>
            <span className="font-semibold text-fg">{team.totalGoldLabel}</span> gold
          </span>
        </div>
      </div>

      {/* Fixed-layout table with horizontal scroll + sticky player column below 1200px */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[276px] xl:w-auto" />
            <col className="w-[120px]" />
            <col className="w-[168px]" />
            <col className="w-[78px]" />
            <col className="w-[74px]" />
            <col className="w-[62px]" />
            <col className="w-[218px]" />
          </colgroup>
          <thead>
            <tr className="h-9 text-[13px] font-medium text-meta-fg hairline-divider-b">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-panel pl-5 pr-3 text-left font-medium"
              >
                Player
              </th>
              <th scope="col" className="px-3 text-right font-medium">
                KDA
              </th>
              <th scope="col" className="px-3 text-right font-medium">
                Damage
              </th>
              <th scope="col" className="px-3 text-right font-medium">
                Gold
              </th>
              <th scope="col" className="px-3 text-right font-medium">
                CS
              </th>
              <th scope="col" className="px-3 text-right font-medium">
                Vision
              </th>
              <th scope="col" className="pl-3 pr-5 text-left font-medium">
                Items
              </th>
            </tr>
          </thead>
          <tbody>
            {team.participants.map((p, idx) => {
              const rowBg = p.isViewedPlayer ? "bg-section/85" : "bg-panel hover:bg-section/40";
              const stickyBg = p.isViewedPlayer
                ? "bg-[#19191C]"
                : "bg-panel group-hover/row:bg-[#161619]";

              return (
                <motion.tr
                  key={p.puuid}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: (rowIndexOffset + idx) * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "group/row h-[60px] transition-colors duration-150",
                    idx < team.participants.length - 1 && "hairline-divider-b",
                    rowBg,
                  )}
                >
                  {/* Player column (sticky on <1200px horizontal scroll) */}
                  <td
                    className={cn(
                      "sticky left-0 z-10 pl-5 pr-3 transition-colors duration-150",
                      stickyBg,
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Champion portrait + level badge (white outline for viewed player, NO gold bar) */}
                      <div
                        className={cn(
                          "relative h-9 w-9 shrink-0 overflow-hidden rounded-[6px]",
                          p.isViewedPlayer ? "ring-[1.5px] ring-fg" : "hairline-divider",
                        )}
                      >
                        <AssetImage
                          src={championSquare(version, p.championId)}
                          alt={p.championName}
                          className="h-full w-full"
                        />
                        <span className="absolute right-0 bottom-0 rounded-tl-[4px] bg-canvas/90 px-1 text-[13px] leading-[15px] font-semibold text-fg tabular">
                          {p.level}
                        </span>
                      </div>

                      {/* Role glyph */}
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center text-meta-fg"
                        title={p.role ? ROLE_LABELS[p.role] : undefined}
                      >
                        {p.role ? (
                          <RoleIcon role={p.role} className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[13px] text-meta-fg/50">—</span>
                        )}
                      </div>

                      {/* Name + tag + MVP chip */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <PlayerNameCell participant={p} platform={platform} />
                          {p.isMvp ? (
                            <Chip variant="mvp" className="px-1.5 py-0 text-[13px] leading-[18px]">
                              MVP
                            </Chip>
                          ) : null}
                        </div>
                        <span className="truncate text-[13px] text-meta-fg">{p.championName}</span>
                      </div>
                    </div>
                  </td>

                  {/* KDA (right-aligned, tabular, visible separators, death-heavy in loss red) */}
                  <td className="px-3 text-right tabular">
                    <div className="flex flex-col items-end">
                      <div className="inline-flex items-baseline gap-1 text-[13px] font-semibold">
                        <span className="text-fg">{p.kills}</span>
                        <span className="font-normal text-border-strong">/</span>
                        <span className={p.isDeathHeavy ? "text-loss" : "text-fg"}>{p.deaths}</span>
                        <span className="font-normal text-border-strong">/</span>
                        <span className="text-fg">{p.assists}</span>
                      </div>
                      <span className="text-[13px] text-meta-fg">
                        {p.kdaRatio} · {p.kp}%
                      </span>
                    </div>
                  </td>

                  {/* Damage + 120x4 neutral breakdown bar */}
                  <td className="px-3 text-right tabular">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[13px] font-medium text-fg">{p.damageLabel}</span>
                      <DamageBar participant={p} />
                    </div>
                  </td>

                  {/* Gold */}
                  <td className="px-3 text-right text-[13px] font-medium text-fg tabular">
                    {p.goldLabel}
                  </td>

                  {/* CS */}
                  <td className="px-3 text-right tabular">
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-medium text-fg">{p.cs}</span>
                      <span className="text-[13px] text-meta-fg">{p.csPerMinLabel}</span>
                    </div>
                  </td>

                  {/* Vision */}
                  <td className="px-3 text-right tabular">
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={`Vision score ${p.visionScore} — ${p.wardsPlaced} placed, ${p.wardsKilled} cleared, ${p.controlWards} control`}
                        render={
                          <span
                            tabIndex={0}
                            className="inline-block text-[13px] font-medium text-fg outline-none"
                          />
                        }
                      >
                        {p.visionScore}
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="tabular">
                          {p.wardsPlaced} placed · {p.wardsKilled} cleared · {p.controlWards}{" "}
                          control
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* Items (22px gap 4 + 8px spacer + 22px trinket) */}
                  <td className="pl-3 pr-5">
                    <div className="flex items-center">
                      <div className="flex items-center gap-1">
                        {p.items.map((item, itemIdx) => (
                          <ScoreboardItemSlot
                            key={`${p.puuid}-item-${itemIdx}`}
                            item={item}
                            version={version}
                          />
                        ))}
                      </div>
                      <div className="w-2 shrink-0" />
                      <ScoreboardItemSlot item={p.trinket} version={version} trinket />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MobilePlayerCard({
  participant: p,
  platform,
  version,
  index,
}: {
  participant: ScoreboardParticipant;
  platform: Platform | null;
  version: string;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "flex flex-col gap-3 rounded-[10px] p-4 hairline-divider",
        p.isViewedPlayer ? "bg-section/85" : "bg-panel",
      )}
    >
      {/* Line 1: portrait + level + role + name + MVP + KDA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className={cn(
              "relative h-9 w-9 shrink-0 overflow-hidden rounded-[6px]",
              p.isViewedPlayer ? "ring-[1.5px] ring-fg" : "hairline-divider",
            )}
          >
            <AssetImage
              src={championSquare(version, p.championId)}
              alt={p.championName}
              className="h-full w-full"
            />
            <span className="absolute right-0 bottom-0 rounded-tl-[4px] bg-canvas/90 px-1 text-[13px] leading-[15px] font-semibold text-fg tabular">
              {p.level}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <PlayerNameCell participant={p} platform={platform} />
              {p.isMvp ? (
                <Chip variant="mvp" className="px-1.5 py-0 text-[13px] leading-[18px]">
                  MVP
                </Chip>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-meta-fg">
              {p.role ? <RoleIcon role={p.role} className="h-3.5 w-3.5 shrink-0" /> : null}
              <span className="truncate">{p.championName}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end tabular">
          <div className="inline-flex items-baseline gap-1 text-[16px] leading-tight font-semibold">
            <span className="text-fg">{p.kills}</span>
            <span className="font-normal text-border-strong">/</span>
            <span className={p.isDeathHeavy ? "text-loss" : "text-fg"}>{p.deaths}</span>
            <span className="font-normal text-border-strong">/</span>
            <span className="text-fg">{p.assists}</span>
          </div>
          <span className="text-[13px] text-meta-fg">
            {p.kdaRatio} · {p.kp}% KP
          </span>
        </div>
      </div>

      {/* Line 2: Damage bar + value */}
      <div className="flex items-center gap-3 tabular">
        <DamageBar participant={p} widthClass="flex-1" />
        <span className="shrink-0 text-[13px] text-meta-fg">
          <span className="font-medium text-fg">{p.damageLabel}</span> dmg
        </span>
      </div>

      {/* Line 3: gold / CS / vision as one meta line */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-meta-fg tabular">
        <span>
          <span className="text-fg font-medium">{p.goldLabel}</span> gold
        </span>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <span>
          <span className="text-fg font-medium">{p.cs}</span> CS ({p.csPerMinLabel})
        </span>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <span>
          <span className="text-fg font-medium">{p.visionScore}</span> vision
        </span>
      </div>

      {/* Line 4: Items strip (touch-friendly 28px slots) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
        {p.items.map((item, itemIdx) => (
          <ScoreboardItemSlot
            key={`${p.puuid}-m-item-${itemIdx}`}
            item={item}
            version={version}
            size="mobile"
          />
        ))}
        <div className="w-1 shrink-0" />
        <ScoreboardItemSlot item={p.trinket} version={version} size="mobile" trinket />
      </div>
    </motion.article>
  );
}

/**
 * Match scoreboards for both Blue and Red teams.
 * - Desktop (md+): fixed-layout tables with right-aligned numeric headers and
 *   sticky player column on horizontal overflow below 1200px.
 * - Mobile (<md, 390px): Blue | Red segmented tabs + per-player cards (Mobile Mandate #2).
 */
export function MatchScoreboard({
  blueTeam,
  redTeam,
  platform,
  version,
  className,
}: MatchScoreboardProps) {
  const defaultMobileTeam: TeamSide = blueTeam.participants.some((p) => p.isViewedPlayer)
    ? "blue"
    : "red";
  const [mobileTeam, setMobileTeam] = React.useState<TeamSide>(defaultMobileTeam);

  React.useEffect(() => {
    setMobileTeam(defaultMobileTeam);
  }, [defaultMobileTeam]);

  const activeMobileTeam = mobileTeam === "blue" ? blueTeam : redTeam;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Desktop / Tablet: both team tables */}
      <div className="hidden flex-col gap-5 md:flex">
        <DesktopTeamTable
          team={blueTeam}
          platform={platform}
          version={version}
          rowIndexOffset={0}
        />
        <DesktopTeamTable
          team={redTeam}
          platform={platform}
          version={version}
          rowIndexOffset={blueTeam.participants.length}
        />
      </div>

      {/* Mobile 390px: Blue | Red tabs + per-player cards */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <SegmentedControl<TeamSide>
            aria-label="Select team scoreboard"
            value={mobileTeam}
            onValueChange={setMobileTeam}
            options={[
              {
                value: "blue",
                label: (
                  <span className="inline-flex items-center gap-1.5 tabular">
                    <span className="h-1.5 w-1.5 rounded-full bg-team-blue" aria-hidden="true" />
                    Blue {blueTeam.totalKills}
                  </span>
                ),
              },
              {
                value: "red",
                label: (
                  <span className="inline-flex items-center gap-1.5 tabular">
                    <span className="h-1.5 w-1.5 rounded-full bg-team-red" aria-hidden="true" />
                    Red {redTeam.totalKills}
                  </span>
                ),
              },
            ]}
          />

          <TeamResultChip team={activeMobileTeam} />
        </div>

        <div className="flex items-center justify-between px-1 text-[13px] text-meta-fg tabular">
          <span>{activeMobileTeam.label}</span>
          <span>
            <span className="font-semibold text-fg">{activeMobileTeam.totalGoldLabel}</span> gold
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {activeMobileTeam.participants.map((p, idx) => (
            <MobilePlayerCard
              key={p.puuid}
              participant={p}
              platform={platform}
              version={version}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchScoreboardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      {[0, 1].map((teamIdx) => (
        <div key={teamIdx} className="overflow-hidden rounded-[12px] bg-panel hairline-divider">
          <div className="flex h-[56px] items-center justify-between px-5 hairline-divider-b">
            <div className="flex items-center gap-2.5">
              <Skeleton rounded="full" className="h-2 w-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton rounded="full" className="h-5 w-16 opacity-70" />
            </div>
            <Skeleton className="h-3.5 w-32 opacity-65" />
          </div>

          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                style={{ opacity: Math.max(0.45, 1 - rowIdx * 0.1) }}
                className={cn(
                  "flex h-[60px] items-center gap-4 px-5",
                  rowIdx < 4 && "hairline-divider-b",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Skeleton rounded="sm" className="h-9 w-9 shrink-0" />
                  <Skeleton rounded="sm" className="h-4 w-4 shrink-0 opacity-60" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-16 opacity-60" />
                  </div>
                </div>
                <Skeleton className="hidden h-4 w-16 sm:block" />
                <div className="hidden flex-col items-end gap-1.5 md:flex">
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-1 w-[120px]" />
                </div>
                <Skeleton className="hidden h-3.5 w-12 lg:block" />
                <Skeleton className="hidden h-3.5 w-10 lg:block" />
                <Skeleton className="hidden h-3.5 w-8 lg:block" />
                <div className="hidden items-center gap-1 md:flex">
                  {Array.from({ length: 6 }).map((__, i) => (
                    <Skeleton key={i} rounded="slot" className="h-[22px] w-[22px]" />
                  ))}
                  <div className="w-1.5" />
                  <Skeleton rounded="full" className="h-[22px] w-[22px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
