import type { StatDeltaTone, SeasonStripProps } from "../../components/stats/season-strip";
import type { RoleSplitEntry, SummaryBandProps } from "../../components/stats/summary-band";
import type { RoleId } from "../../components/ui/role-icons";
import type { ChampionIndex, RuneStyle, SpellData } from "../api/ddragon";
import { queueLabel } from "../api/queues";
import type { LeagueEntryDTO, MatchDTO, MatchParticipantDTO, TimelineDTO } from "../riot/types";

export const FALLBACK_DDRAGON_VERSION = "16.23.1";

/** Queue IDs considered ranked for LP estimation. */
export const RANKED_SOLO_QUEUE_ID = 420;
export const RANKED_FLEX_QUEUE_ID = 440;

export interface MatchAssetLookups {
  version: string;
  champions?: ChampionIndex;
  spells?: Record<string, SpellData>;
  runes?: RuneStyle[];
}

export interface TeamMemberSummary {
  puuid: string;
  championId: string;
  championName: string;
  summonerName: string;
  isViewedPlayer: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchRowViewModel {
  id: string;
  queueId: number;
  queueName: string;
  win: boolean;
  isRemake: boolean;
  isMvp: boolean;
  durationSeconds: number;
  durationLabel: string;
  timestampMs: number;
  agoLabel: string;
  dayKey: string;
  dayLabel: string;
  championId: string;
  championName: string;
  level: number;
  role: RoleId | null;
  spells: [string | null, string | null];
  spellNames: [string, string];
  keystoneIcon: string | null;
  secondaryRuneIcon: string | null;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: string;
  kdaNumeric: number;
  cs: number;
  csPerMin: number;
  csPerMinLabel: string;
  kp: number;
  vision: number;
  items: number[];
  trinket: number;
  opponentId: string | null;
  opponentName: string | null;
  opponentParticipantId: number | null;
  playerParticipantId: number;
  playerTeamId: number;
  goldEarned: number;
  goldEarnedLabel: string;
  goldPerMin: number;
  damageToChampions: number;
  damageTotalLabel: string;
  damagePerMin: number;
  damageSharePct: number;
  damageRank: number;
  damageSplit: {
    physical: number;
    magic: number;
    trueDmg: number;
  };
  teamKills: number;
  enemyKills: number;
  teamGold: number;
  enemyGold: number;
  highlights: string[];
  allies: TeamMemberSummary[];
  enemies: TeamMemberSummary[];
  /** Riot match-v5 does not include per-match LP deltas; null signals honest fallback. */
  lpDelta: number | null;
}

export interface MostPlayedEntry {
  championId: string;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRatePct: number;
  kdaRatio: string;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

export interface PerformancePoint {
  index: number;
  gameLabel: string;
  matchId: string;
  championName: string;
  win: boolean;
  kdaText: string;
  value: number;
  deltaLabel: string;
}

export interface PerformanceSeries {
  mode: "lp_estimated" | "kda";
  points: PerformancePoint[];
  terminalLabel: string;
  summaryDeltaLabel: string;
  summaryDeltaTone: StatDeltaTone;
  sourceLabel: string;
}

export interface TimelineInsight {
  curve: { minute: number; diffK: number }[];
  finalLeadK: number;
  finalLeadLabel: string;
  durationMin: number;
  csDiff15: number | null;
  goldDiff15: number | null;
}

/** Match-v5 reports duration in seconds; migrated legacy matches occasionally report ms. */
export function normalizeDurationSeconds(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }
  return raw > 100_000 ? Math.round(raw / 1000) : Math.round(raw);
}

export function isRemakeDuration(durationSeconds: number): boolean {
  return durationSeconds > 0 && durationSeconds < 300;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}${Math.round(abs)}`;
}

export function formatRelativeTime(timestampMs: number, nowMs = Date.now()): string {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
    return "—";
  }
  const diffSec = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));
  if (diffSec < 60) {
    return "Just now";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) {
    return `${diffDay}d ago`;
  }
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

export function getMatchTimestampMs(match: MatchDTO): number {
  const end = match.info.gameEndTimestamp;
  if (end && end > 0) {
    return end;
  }
  const start = match.info.gameStartTimestamp ?? match.info.gameCreation;
  const durationMs = normalizeDurationSeconds(match.info.gameDuration) * 1000;
  return start + durationMs;
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatDayBucket(
  timestampMs: number,
  nowMs = Date.now(),
): { key: string; label: string } {
  const date = new Date(timestampMs);
  const now = new Date(nowMs);

  const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfTarget) / 86_400_000);

  if (dayDiff === 0) {
    return { key: dayKey, label: "Today" };
  }
  if (dayDiff === 1) {
    return { key: dayKey, label: "Yesterday" };
  }
  const month = MONTH_SHORT[date.getMonth()] ?? "";
  const sameYear = date.getFullYear() === now.getFullYear();
  return {
    key: dayKey,
    label: sameYear
      ? `${month} ${date.getDate()}`
      : `${month} ${date.getDate()}, ${date.getFullYear()}`,
  };
}

/** Fix known Riot championName casing mismatches against Data Dragon filenames. */
const CHAMPION_ID_ALIASES: Record<string, string> = {
  FiddleSticks: "Fiddlesticks",
};

export function resolveChampionIdentity(
  championId: number,
  rawChampionName: string | undefined,
  champions?: ChampionIndex,
): { id: string; name: string } {
  const fromNumeric = champions?.byNumericKey[String(championId)];
  if (fromNumeric) {
    return { id: fromNumeric.id, name: fromNumeric.name };
  }
  if (rawChampionName) {
    const normalized = CHAMPION_ID_ALIASES[rawChampionName] ?? rawChampionName;
    const fromString = champions?.byStringId[normalized];
    if (fromString) {
      return { id: fromString.id, name: fromString.name };
    }
    return { id: normalized, name: normalized };
  }
  return { id: String(championId), name: `Champion ${championId}` };
}

export function resolveRole(participant: MatchParticipantDTO): RoleId | null {
  const raw = (participant.teamPosition || participant.individualPosition || "").toUpperCase();
  switch (raw) {
    case "TOP":
      return "top";
    case "JUNGLE":
      return "jungle";
    case "MIDDLE":
    case "MID":
      return "mid";
    case "BOTTOM":
    case "BOT":
      return "bot";
    case "UTILITY":
    case "SUPPORT":
      return "support";
    default:
      return null;
  }
}

export function resolveRuneIcons(
  participant: MatchParticipantDTO,
  runes?: RuneStyle[],
): { keystoneIcon: string | null; secondaryIcon: string | null } {
  const styles = participant.perks?.styles;
  if (!styles || styles.length === 0 || !runes || runes.length === 0) {
    return { keystoneIcon: null, secondaryIcon: null };
  }

  const primary = styles[0];
  const secondary = styles[1];
  const keystoneId = primary?.selections?.[0]?.perk;

  let keystoneIcon: string | null = null;
  let secondaryIcon: string | null = null;

  for (const style of runes) {
    if (secondary && style.id === secondary.style) {
      secondaryIcon = style.icon;
    }
    if (keystoneId !== undefined && !keystoneIcon) {
      for (const slot of style.slots) {
        const found = slot.runes.find((r) => r.id === keystoneId);
        if (found) {
          keystoneIcon = found.icon;
          break;
        }
      }
    }
  }

  return { keystoneIcon, secondaryIcon };
}

export function findLaneOpponent(
  participants: readonly MatchParticipantDTO[],
  player: MatchParticipantDTO,
): MatchParticipantDTO | null {
  const enemies = participants.filter((p) => p.teamId !== player.teamId);
  if (enemies.length === 0) {
    return null;
  }
  const playerRole = resolveRole(player);
  if (playerRole) {
    const matched = enemies.find((enemy) => resolveRole(enemy) === playerRole);
    if (matched) {
      return matched;
    }
  }
  return enemies[0] ?? null;
}

function participantDisplayName(p: MatchParticipantDTO): string {
  if (p.riotIdGameName) {
    return p.riotIdGameName;
  }
  return p.summonerName || p.championName;
}

function computeParticipantImpactScore(
  p: MatchParticipantDTO,
  teamKills: number,
  teamDamage: number,
): number {
  const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
  const kp = teamKills > 0 ? (p.kills + p.assists) / teamKills : 0;
  const dmgShare = teamDamage > 0 ? p.totalDamageDealtToChampions / teamDamage : 0;
  const visionBonus = Math.min(1, p.visionScore / 50) * 0.4;
  return kda * 0.45 + kp * 3.0 + dmgShare * 4.5 + visionBonus;
}

function buildHighlights(
  player: MatchParticipantDTO,
  damageRank: number,
  kp: number,
  isMvp: boolean,
  isRemake: boolean,
): string[] {
  if (isRemake) {
    return ["Remake"];
  }
  const tags: string[] = [];
  const c = player.challenges;

  if (isMvp) {
    tags.push("Top impact");
  }
  if (damageRank === 1) {
    tags.push("#1 damage");
  }
  if (player.deaths === 0 && player.kills + player.assists >= 5) {
    tags.push("Deathless");
  }
  if (c?.soloKills && c.soloKills >= 2) {
    tags.push(`${c.soloKills} solo kills`);
  } else if (c?.soloKills === 1) {
    tags.push("Solo kill");
  }
  if (kp >= 70) {
    tags.push(`${kp}% KP`);
  }
  const objectiveCount = (c?.dragonTakedowns ?? 0) + (c?.baronTakedowns ?? 0);
  if (objectiveCount >= 3) {
    tags.push("Objective control");
  }
  if (player.visionScore >= 40) {
    tags.push(`${player.visionScore} vision`);
  }

  if (tags.length === 0) {
    tags.push(player.win ? "Win" : "Defeat");
  }
  return tags.slice(0, 4);
}

export function buildMatchRowViewModel(
  match: MatchDTO,
  puuid: string,
  lookups: MatchAssetLookups,
): MatchRowViewModel | null {
  const participants = match.info.participants;
  const player = participants.find((p) => p.puuid === puuid);
  if (!player) {
    return null;
  }

  const durationSeconds = normalizeDurationSeconds(match.info.gameDuration);
  const isRemake = isRemakeDuration(durationSeconds);
  const durationMin = Math.max(1 / 60, durationSeconds / 60);
  const timestampMs = getMatchTimestampMs(match);
  const { key: dayKey, label: dayLabel } = formatDayBucket(timestampMs);

  const champ = resolveChampionIdentity(player.championId, player.championName, lookups.champions);
  const spell1 = lookups.spells?.[String(player.summoner1Id)];
  const spell2 = lookups.spells?.[String(player.summoner2Id)];
  const { keystoneIcon, secondaryIcon } = resolveRuneIcons(player, lookups.runes);

  const alliesRaw = participants.filter((p) => p.teamId === player.teamId);
  const enemiesRaw = participants.filter((p) => p.teamId !== player.teamId);

  const teamKills = alliesRaw.reduce((sum, p) => sum + p.kills, 0);
  const enemyKills = enemiesRaw.reduce((sum, p) => sum + p.kills, 0);
  const teamGold = alliesRaw.reduce((sum, p) => sum + p.goldEarned, 0);
  const enemyGold = enemiesRaw.reduce((sum, p) => sum + p.goldEarned, 0);
  const teamDamage = alliesRaw.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0);

  const kdaNumeric = (player.kills + player.assists) / Math.max(1, player.deaths);
  const kdaRatio = player.deaths === 0 ? "Perfect" : kdaNumeric.toFixed(2);

  const cs = (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0);
  const csPerMin = cs / durationMin;

  const rawKp =
    player.challenges?.killParticipation !== undefined
      ? player.challenges.killParticipation * 100
      : teamKills > 0
        ? ((player.kills + player.assists) / teamKills) * 100
        : 0;
  const kp = Math.min(100, Math.max(0, Math.round(rawKp)));

  const sortedByDamage = [...participants].sort(
    (a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions,
  );
  const damageRank =
    sortedByDamage.findIndex((p) => p.participantId === player.participantId) + 1 || 1;
  const damageSharePct =
    teamDamage > 0 ? Math.round((player.totalDamageDealtToChampions / teamDamage) * 100) : 0;

  const totalDmgTypes = Math.max(
    1,
    player.physicalDamageDealtToChampions +
      player.magicDamageDealtToChampions +
      player.trueDamageDealtToChampions,
  );
  const physPct = Math.round((player.physicalDamageDealtToChampions / totalDmgTypes) * 100);
  const magicPct = Math.round((player.magicDamageDealtToChampions / totalDmgTypes) * 100);
  const truePct = Math.max(0, 100 - physPct - magicPct);

  // MVP: winning-team player with the highest composite impact score
  let isMvp = false;
  if (player.win && !isRemake && alliesRaw.length > 0) {
    let bestPuuid = alliesRaw[0]?.puuid;
    let bestScore = -1;
    for (const ally of alliesRaw) {
      const score = computeParticipantImpactScore(ally, teamKills, teamDamage);
      if (score > bestScore) {
        bestScore = score;
        bestPuuid = ally.puuid;
      }
    }
    isMvp = bestPuuid === player.puuid;
  }

  const opponent = findLaneOpponent(participants, player);
  const opponentIdentity = opponent
    ? resolveChampionIdentity(opponent.championId, opponent.championName, lookups.champions)
    : null;

  const toSummary = (p: MatchParticipantDTO): TeamMemberSummary => {
    const identity = resolveChampionIdentity(p.championId, p.championName, lookups.champions);
    return {
      puuid: p.puuid,
      championId: identity.id,
      championName: identity.name,
      summonerName: participantDisplayName(p),
      isViewedPlayer: p.puuid === puuid,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
    };
  };

  return {
    id: match.metadata.matchId,
    queueId: match.info.queueId,
    queueName: queueLabel(match.info.queueId),
    win: player.win,
    isRemake,
    isMvp,
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    timestampMs,
    agoLabel: formatRelativeTime(timestampMs),
    dayKey,
    dayLabel,
    championId: champ.id,
    championName: champ.name,
    level: player.champLevel,
    role: resolveRole(player),
    spells: [spell1?.id ?? null, spell2?.id ?? null],
    spellNames: [spell1?.name ?? "Spell 1", spell2?.name ?? "Spell 2"],
    keystoneIcon,
    secondaryRuneIcon: secondaryIcon,
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    kdaRatio,
    kdaNumeric,
    cs,
    csPerMin,
    csPerMinLabel: `${csPerMin.toFixed(1)}/m`,
    kp,
    vision: player.visionScore,
    items: [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5],
    trinket: player.item6,
    opponentId: opponentIdentity?.id ?? null,
    opponentName: opponentIdentity?.name ?? null,
    opponentParticipantId: opponent?.participantId ?? null,
    playerParticipantId: player.participantId,
    playerTeamId: player.teamId,
    goldEarned: player.goldEarned,
    goldEarnedLabel: formatCompactNumber(player.goldEarned),
    goldPerMin: Math.round(player.goldEarned / durationMin),
    damageToChampions: player.totalDamageDealtToChampions,
    damageTotalLabel: player.totalDamageDealtToChampions.toLocaleString("en-US"),
    damagePerMin: Math.round(player.totalDamageDealtToChampions / durationMin),
    damageSharePct,
    damageRank,
    damageSplit: {
      physical: physPct,
      magic: magicPct,
      trueDmg: truePct,
    },
    teamKills,
    enemyKills,
    teamGold,
    enemyGold,
    highlights: buildHighlights(player, damageRank, kp, isMvp, isRemake),
    allies: alliesRaw.map(toSummary),
    enemies: enemiesRaw.map(toSummary),
    lpDelta: null,
  };
}

// ---------------------------------------------------------------------------
// Aggregates (SeasonStrip, SummaryBand, MostPlayed, LP/KDA Chart, Timeline)
// ---------------------------------------------------------------------------

interface AggregateSample {
  games: number;
  wins: number;
  losses: number;
  winRatePct: number;
  kdaRatio: number;
  csPerMin: number;
  avgCs: number;
  kpPct: number;
  avgDurationSeconds: number;
  roles: RoleSplitEntry[];
}

function aggregateMatches(matches: readonly MatchDTO[], puuid: string): AggregateSample | null {
  let games = 0;
  let wins = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let totalCs = 0;
  let totalCsPerMin = 0;
  let totalKp = 0;
  let totalDuration = 0;
  const roleCounts = new Map<RoleId, number>();

  for (const match of matches) {
    const duration = normalizeDurationSeconds(match.info.gameDuration);
    if (isRemakeDuration(duration)) {
      continue;
    }
    const player = match.info.participants.find((p) => p.puuid === puuid);
    if (!player) {
      continue;
    }

    games += 1;
    if (player.win) {
      wins += 1;
    }
    kills += player.kills;
    deaths += player.deaths;
    assists += player.assists;

    const cs = (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0);
    totalCs += cs;
    totalCsPerMin += cs / Math.max(1 / 60, duration / 60);

    const teamKills = match.info.participants
      .filter((p) => p.teamId === player.teamId)
      .reduce((sum, p) => sum + p.kills, 0);
    const kp =
      player.challenges?.killParticipation !== undefined
        ? player.challenges.killParticipation * 100
        : teamKills > 0
          ? ((player.kills + player.assists) / teamKills) * 100
          : 0;
    totalKp += Math.min(100, Math.max(0, kp));
    totalDuration += duration;

    const role = resolveRole(player);
    if (role) {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
    }
  }

  if (games === 0) {
    return null;
  }

  const roles: RoleSplitEntry[] = [...roleCounts.entries()]
    .map(([role, count]) => ({ role, games: count }))
    .sort((a, b) => b.games - a.games);

  return {
    games,
    wins,
    losses: games - wins,
    winRatePct: (wins / games) * 100,
    kdaRatio: (kills + assists) / Math.max(1, deaths),
    csPerMin: totalCsPerMin / games,
    avgCs: totalCs / games,
    kpPct: totalKp / games,
    avgDurationSeconds: totalDuration / games,
    roles,
  };
}

function formatNumericDelta(
  diff: number | null,
  decimals: number,
  suffix = "",
  epsilon = 0.05,
): { text: string; tone: StatDeltaTone } {
  if (diff === null || !Number.isFinite(diff)) {
    return { text: "—", tone: "neutral" };
  }
  if (Math.abs(diff) < epsilon) {
    return { text: `±0${suffix}`, tone: "neutral" };
  }
  const sign = diff > 0 ? "+" : "";
  return {
    text: `${sign}${diff.toFixed(decimals)}${suffix}`,
    tone: diff > 0 ? "positive" : "negative",
  };
}

function formatDurationDelta(diffSeconds: number | null): { text: string; tone: StatDeltaTone } {
  if (diffSeconds === null || !Number.isFinite(diffSeconds)) {
    return { text: "—", tone: "neutral" };
  }
  const rounded = Math.round(diffSeconds);
  if (Math.abs(rounded) < 15) {
    return { text: "±0:00", tone: "neutral" };
  }
  const sign = rounded > 0 ? "+" : "-";
  return {
    text: `${sign}${formatDuration(Math.abs(rounded))}`,
    tone: "neutral",
  };
}

function formatPatchShort(version: string | undefined): string {
  if (!version) {
    return "—";
  }
  const parts = version.split(".");
  return parts.length >= 2 ? `Patch ${parts[0]}.${parts[1]}` : version;
}

export function computeSeasonStripData(
  recentMatches: readonly MatchDTO[],
  priorMatches: readonly MatchDTO[],
  puuid: string,
  rankedEntries: readonly LeagueEntryDTO[] | undefined,
  ddragonVersion: string | undefined,
): Omit<SeasonStripProps, "className"> {
  const current = aggregateMatches(recentMatches, puuid);
  const prior = priorMatches.length >= 5 ? aggregateMatches(priorMatches, puuid) : null;

  const rankedTotalWins = (rankedEntries ?? []).reduce((sum, e) => sum + e.wins, 0);
  const rankedTotalLosses = (rankedEntries ?? []).reduce((sum, e) => sum + e.losses, 0);
  const rankedTotalGames = rankedTotalWins + rankedTotalLosses;

  const latestPatch = recentMatches[0]?.info.gameVersion ?? ddragonVersion;

  if (!current) {
    return {
      hero: {
        id: "season-kda",
        label: "Recent KDA",
        value: "—",
        context: "No matches",
        delta: "—",
        deltaTone: "neutral",
      },
      stats: [
        {
          id: "win-rate",
          label: "Win rate",
          value:
            rankedTotalGames > 0
              ? `${Math.round((rankedTotalWins / rankedTotalGames) * 100)}%`
              : "—",
          context: rankedTotalGames > 0 ? `${rankedTotalWins}W ${rankedTotalLosses}L` : "—",
          delta: "—",
          deltaTone: "neutral",
        },
        {
          id: "games",
          label: "Games",
          value: rankedTotalGames > 0 ? String(rankedTotalGames) : "0",
          context: rankedTotalGames > 0 ? "Ranked season" : "Recent",
          delta: "—",
          deltaTone: "neutral",
        },
        {
          id: "cs-per-min",
          label: "CS / min",
          value: "—",
          context: "—",
          delta: "—",
          deltaTone: "neutral",
        },
        {
          id: "kill-participation",
          label: "Kill participation",
          value: "—",
          context: "—",
          delta: "—",
          deltaTone: "neutral",
        },
        {
          id: "avg-length",
          label: "Avg length",
          value: "—",
          context: formatPatchShort(latestPatch),
          delta: "—",
          deltaTone: "neutral",
        },
      ],
    };
  }

  const kdaDelta = formatNumericDelta(
    prior ? current.kdaRatio - prior.kdaRatio : null,
    2,
    "",
    0.02,
  );
  const wrDelta = formatNumericDelta(
    prior ? current.winRatePct - prior.winRatePct : null,
    1,
    "%",
    0.5,
  );
  const csDelta = formatNumericDelta(prior ? current.csPerMin - prior.csPerMin : null, 1, "", 0.1);
  const kpDelta = formatNumericDelta(prior ? current.kpPct - prior.kpPct : null, 0, "%", 1);
  const lenDelta = formatDurationDelta(
    prior ? current.avgDurationSeconds - prior.avgDurationSeconds : null,
  );

  return {
    hero: {
      id: "season-kda",
      label: "Recent KDA",
      value: current.kdaRatio.toFixed(2),
      context: `Last ${current.games} games`,
      delta: kdaDelta.text,
      deltaTone: kdaDelta.tone,
    },
    stats: [
      {
        id: "win-rate",
        label: "Win rate",
        value: `${Math.round(current.winRatePct)}%`,
        context: `${current.wins}W ${current.losses}L`,
        delta: wrDelta.text,
        deltaTone: wrDelta.tone,
      },
      {
        id: "games",
        label: "Games",
        value: rankedTotalGames > 0 ? String(rankedTotalGames) : String(current.games),
        context:
          rankedTotalGames > 0
            ? `${rankedTotalWins}W ${rankedTotalLosses}L`
            : `Last ${current.games}`,
        delta: "—",
        deltaTone: "neutral",
      },
      {
        id: "cs-per-min",
        label: "CS / min",
        value: current.csPerMin.toFixed(1),
        context: `${Math.round(current.avgCs)} avg`,
        delta: csDelta.text,
        deltaTone: csDelta.tone,
      },
      {
        id: "kill-participation",
        label: "Kill participation",
        value: `${Math.round(current.kpPct)}%`,
        context: `${current.games} games`,
        delta: kpDelta.text,
        deltaTone: kpDelta.tone,
      },
      {
        id: "avg-length",
        label: "Avg length",
        value: formatDuration(current.avgDurationSeconds),
        context: formatPatchShort(latestPatch),
        delta: lenDelta.text,
        deltaTone: lenDelta.tone,
      },
    ],
  };
}

export function computeSummaryBandData(
  matches: readonly MatchDTO[],
  priorMatches: readonly MatchDTO[],
  puuid: string,
): Omit<SummaryBandProps, "className"> {
  const sample = aggregateMatches(matches, puuid);
  const prior = priorMatches.length >= 5 ? aggregateMatches(priorMatches, puuid) : null;

  // Form strip displays oldest -> newest (left -> right) matching "Oldest ... Latest" labels
  const nonRemakeMatches = matches.filter(
    (m) => !isRemakeDuration(normalizeDurationSeconds(m.info.gameDuration)),
  );
  const recent20 = nonRemakeMatches.slice(0, 20);
  const recentForm = [...recent20]
    .reverse()
    .map((m) => Boolean(m.info.participants.find((p) => p.puuid === puuid)?.win));

  if (!sample) {
    return {
      winRate: "—",
      wins: 0,
      losses: 0,
      recentForm: [],
      formLabel: "Form",
      formContext: "0W 0L",
      metrics: [
        { id: "kda", label: "KDA", value: "—", delta: "—", deltaTone: "neutral" },
        { id: "kp", label: "KP", value: "—", delta: "—", deltaTone: "neutral" },
        { id: "cs-min", label: "CS / min", value: "—", delta: "—", deltaTone: "neutral" },
      ],
      roles: [],
    };
  }

  const wrDelta = formatNumericDelta(
    prior ? sample.winRatePct - prior.winRatePct : null,
    0,
    "%",
    0.5,
  );
  const kdaDelta = formatNumericDelta(prior ? sample.kdaRatio - prior.kdaRatio : null, 2, "", 0.02);
  const kpDelta = formatNumericDelta(prior ? sample.kpPct - prior.kpPct : null, 0, "%", 1);
  const csDelta = formatNumericDelta(prior ? sample.csPerMin - prior.csPerMin : null, 1, "", 0.1);

  const formWins = recentForm.filter(Boolean).length;
  const formLosses = recentForm.length - formWins;

  return {
    winRate: `${Math.round(sample.winRatePct)}%`,
    wins: sample.wins,
    losses: sample.losses,
    winRateDelta: prior ? wrDelta.text : undefined,
    winRateDeltaTone: wrDelta.tone,
    recentForm,
    formLabel: `Last ${recentForm.length}`,
    formContext: `${formWins}W ${formLosses}L`,
    metrics: [
      {
        id: "kda",
        label: "KDA",
        value: sample.kdaRatio.toFixed(2),
        delta: kdaDelta.text,
        deltaTone: kdaDelta.tone,
      },
      {
        id: "kp",
        label: "KP",
        value: `${Math.round(sample.kpPct)}%`,
        delta: kpDelta.text,
        deltaTone: kpDelta.tone,
      },
      {
        id: "cs-min",
        label: "CS / min",
        value: sample.csPerMin.toFixed(1),
        delta: csDelta.text,
        deltaTone: csDelta.tone,
      },
    ],
    roles: sample.roles,
  };
}

export function computeMostPlayed(
  matches: readonly MatchDTO[],
  puuid: string,
  champions?: ChampionIndex,
): MostPlayedEntry[] {
  const buckets = new Map<
    string,
    {
      championId: string;
      championName: string;
      games: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
    }
  >();

  for (const match of matches) {
    const duration = normalizeDurationSeconds(match.info.gameDuration);
    if (isRemakeDuration(duration)) {
      continue;
    }
    const player = match.info.participants.find((p) => p.puuid === puuid);
    if (!player) {
      continue;
    }

    const identity = resolveChampionIdentity(player.championId, player.championName, champions);
    const existing = buckets.get(identity.id) ?? {
      championId: identity.id,
      championName: identity.name,
      games: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    };

    existing.games += 1;
    if (player.win) {
      existing.wins += 1;
    }
    existing.kills += player.kills;
    existing.deaths += player.deaths;
    existing.assists += player.assists;
    buckets.set(identity.id, existing);
  }

  return [...buckets.values()]
    .sort((a, b) => b.games - a.games || b.wins - a.wins)
    .slice(0, 5)
    .map((entry) => {
      const kda = (entry.kills + entry.assists) / Math.max(1, entry.deaths);
      return {
        championId: entry.championId,
        championName: entry.championName,
        games: entry.games,
        wins: entry.wins,
        losses: entry.games - entry.wins,
        winRatePct: Math.round((entry.wins / entry.games) * 100),
        kdaRatio: entry.deaths === 0 ? "Perfect" : kda.toFixed(2),
        avgKills: entry.kills / entry.games,
        avgDeaths: entry.deaths / entry.games,
        avgAssists: entry.assists / entry.games,
      };
    });
}

/**
 * Computes either:
 * - "lp_estimated": anchored to real `leaguePoints` from league-v4, walking backwards
 *   over recent ranked games using standard +18 win / -14 loss deltas (clearly labeled estimated).
 * - "kda": 100% real per-game KDA ratio across recent non-remake matches.
 */
export function computePerformanceSeries(
  matches: readonly MatchDTO[],
  puuid: string,
  rankedEntries: readonly LeagueEntryDTO[] | undefined,
  preferredMode: "auto" | "lp_estimated" | "kda" = "auto",
  champions?: ChampionIndex,
): PerformanceSeries | null {
  const validMatches = matches.filter((m) => {
    const duration = normalizeDurationSeconds(m.info.gameDuration);
    return !isRemakeDuration(duration) && m.info.participants.some((p) => p.puuid === puuid);
  });

  if (validMatches.length === 0) {
    return null;
  }

  const soloEntry = rankedEntries?.find((e) => e.queueType === "RANKED_SOLO_5x5");
  const flexEntry = rankedEntries?.find((e) => e.queueType === "RANKED_FLEX_SR");
  const primaryEntry = soloEntry ?? flexEntry;
  const targetQueueId = soloEntry ? RANKED_SOLO_QUEUE_ID : RANKED_FLEX_QUEUE_ID;

  const rankedMatches = primaryEntry
    ? validMatches.filter((m) => m.info.queueId === targetQueueId)
    : [];

  const canBuildLp = Boolean(primaryEntry && rankedMatches.length >= 2);
  const mode: "lp_estimated" | "kda" =
    preferredMode === "kda" ? "kda" : canBuildLp ? "lp_estimated" : "kda";

  if (mode === "lp_estimated" && primaryEntry) {
    // Chronological order: oldest -> newest
    const ordered = [...rankedMatches].reverse();
    const WIN_DELTA = 18;
    const LOSS_DELTA = -14;

    // Walk backwards from real current LP so the terminal point is the exact current leaguePoints
    const values: number[] = Array.from({ length: ordered.length }, () => 0);
    values[ordered.length - 1] = primaryEntry.leaguePoints;
    for (let i = ordered.length - 1; i > 0; i -= 1) {
      const match = ordered[i];
      const player = match?.info.participants.find((p) => p.puuid === puuid);
      const step = player?.win ? WIN_DELTA : LOSS_DELTA;
      values[i - 1] = values[i]! - step;
    }

    const points: PerformancePoint[] = ordered.map((match, idx) => {
      const player = match.info.participants.find((p) => p.puuid === puuid)!;
      const champ = resolveChampionIdentity(player.championId, player.championName, champions);
      const step = player.win ? WIN_DELTA : LOSS_DELTA;
      return {
        index: idx + 1,
        gameLabel: `G${idx + 1}`,
        matchId: match.metadata.matchId,
        championName: champ.name,
        win: player.win,
        kdaText: `${player.kills}/${player.deaths}/${player.assists}`,
        value: values[idx]!,
        deltaLabel: `${step > 0 ? "+" : ""}${step} LP (est.)`,
      };
    });

    const netDelta = points[points.length - 1]!.value - points[0]!.value;
    const netTone: StatDeltaTone =
      netDelta > 0 ? "positive" : netDelta < 0 ? "negative" : "neutral";

    return {
      mode: "lp_estimated",
      points,
      terminalLabel: `${primaryEntry.leaguePoints} LP`,
      summaryDeltaLabel: `${netDelta > 0 ? "+" : ""}${netDelta} LP est.`,
      summaryDeltaTone: netTone,
      sourceLabel: `Estimated (+18/-14) · ${points.length} ranked`,
    };
  }

  // Real per-game KDA trend (chronological: oldest -> newest)
  const ordered = [...validMatches].reverse();
  const points: PerformancePoint[] = ordered.map((match, idx) => {
    const player = match.info.participants.find((p) => p.puuid === puuid)!;
    const champ = resolveChampionIdentity(player.championId, player.championName, champions);
    const kdaVal = Number(
      ((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2),
    );
    return {
      index: idx + 1,
      gameLabel: `G${idx + 1}`,
      matchId: match.metadata.matchId,
      championName: champ.name,
      win: player.win,
      kdaText: `${player.kills}/${player.deaths}/${player.assists}`,
      value: kdaVal,
      deltaLabel: `${kdaVal.toFixed(2)} KDA`,
    };
  });

  const last = points[points.length - 1]!;
  const avg = points.reduce((sum, p) => sum + p.value, 0) / points.length;

  return {
    mode: "kda",
    points,
    terminalLabel: `${last.value.toFixed(2)} KDA`,
    summaryDeltaLabel: `${avg.toFixed(2)} avg`,
    summaryDeltaTone: "neutral",
    sourceLabel: `Real KDA · Last ${points.length} games`,
  };
}

/**
 * Extracts real per-minute team gold advantage & @15 lane differentials from a TimelineDTO.
 */
export function computeTimelineInsight(
  timeline: TimelineDTO | null | undefined,
  match: MatchDTO,
  playerTeamId: number,
  playerParticipantId: number,
  opponentParticipantId: number | null,
): TimelineInsight | null {
  const frames = timeline?.info?.frames;
  if (!frames || frames.length < 2) {
    return null;
  }

  const allyIds = new Set<number>(
    match.info.participants.filter((p) => p.teamId === playerTeamId).map((p) => p.participantId),
  );

  const curve: { minute: number; diffK: number }[] = [];

  for (const frame of frames) {
    const minute = Math.round(frame.timestamp / 60_000);
    let allyGold = 0;
    let enemyGold = 0;

    for (const pf of Object.values(frame.participantFrames)) {
      if (allyIds.has(pf.participantId)) {
        allyGold += pf.totalGold;
      } else {
        enemyGold += pf.totalGold;
      }
    }

    curve.push({
      minute,
      diffK: Number(((allyGold - enemyGold) / 1000).toFixed(2)),
    });
  }

  // @15 minute frame (index 15 or closest frame >= 15 min)
  const frame15 = frames.length > 15 ? frames[15] : null;
  let csDiff15: number | null = null;
  let goldDiff15: number | null = null;

  if (frame15 && opponentParticipantId !== null) {
    const playerFrame = frame15.participantFrames[String(playerParticipantId)];
    const oppFrame = frame15.participantFrames[String(opponentParticipantId)];
    if (playerFrame && oppFrame) {
      const playerCs = playerFrame.minionsKilled + playerFrame.jungleMinionsKilled;
      const oppCs = oppFrame.minionsKilled + oppFrame.jungleMinionsKilled;
      csDiff15 = playerCs - oppCs;
      goldDiff15 = playerFrame.totalGold - oppFrame.totalGold;
    }
  }

  const last = curve[curve.length - 1] ?? { minute: 0, diffK: 0 };
  const sign = last.diffK > 0 ? "+" : "";

  return {
    curve,
    finalLeadK: last.diffK,
    finalLeadLabel: `${sign}${last.diffK.toFixed(1)}k`,
    durationMin: last.minute,
    csDiff15,
    goldDiff15,
  };
}
