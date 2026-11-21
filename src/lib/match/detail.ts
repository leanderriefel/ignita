import type { RoleId } from "../../components/ui/role-icons";
import type { ItemData, RuneData, RuneStyle } from "../api/ddragon";
import { mapLabel, queueLabel } from "../api/queues";
import { isPlatform, platformFromMatchId, type Platform } from "../riot/regions";
import type { MatchDTO, MatchParticipantDTO, MatchTeamDTO, TimelineDTO } from "../riot/types";
import {
  formatCompactNumber,
  formatDuration,
  getMatchTimestampMs,
  isRemakeDuration,
  normalizeDurationSeconds,
  resolveChampionIdentity,
  resolveRole,
  type MatchAssetLookups,
} from "./transform";

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

const ROLE_SORT_ORDER: Record<RoleId, number> = {
  top: 0,
  jungle: 1,
  mid: 2,
  bot: 3,
  support: 4,
};

export type TeamSide = "blue" | "red";

export interface MatchReferrer {
  platform: Platform;
  name: string;
  tag: string;
  label: string;
}

export interface MatchObjectivePair {
  id: "baron" | "dragon" | "tower" | "voidgrubs" | "inhibitor";
  label: string;
  blue: number;
  red: number;
}

export interface FirstEventSummary {
  id: "blood" | "tower" | "dragon";
  label: string;
  team: TeamSide;
  /** Real MM:SS timestamp from timeline, or null when timeline is absent. */
  timeLabel: string | null;
}

export interface ResolvedRune {
  id: number;
  name: string;
  icon: string | null;
}

export interface ResolvedSpell {
  id: number;
  key: string | null;
  name: string;
}

export interface ResolvedItem {
  id: number;
  name: string | null;
  goldTotal: number | null;
}

export type SkillLetter = "Q" | "W" | "E" | "R";
export type BasicSkillLetter = "Q" | "W" | "E";

export interface SkillOrderSummary {
  priorityOrder: BasicSkillLetter[];
  priorityLabel: string;
  ultimateLevels: number[];
  ultimateLabel: string | null;
  firstThree: SkillLetter[];
  totalLevels: number;
}

export interface ViewedPlayerLoadout {
  championId: string;
  championName: string;
  level: number;
  role: RoleId | null;
  displayName: string;
  tagLine: string | null;
  primaryTreeName: string | null;
  primaryTreeIcon: string | null;
  keystone: ResolvedRune | null;
  primaryRunes: ResolvedRune[];
  secondaryTreeName: string | null;
  secondaryTreeIcon: string | null;
  secondaryRunes: ResolvedRune[];
  spells: [ResolvedSpell, ResolvedSpell];
  items: ResolvedItem[];
  trinket: ResolvedItem;
  skillOrder: SkillOrderSummary | null;
}

export interface GoldCurvePoint {
  minute: number;
  timeLabel: string;
  diffK: number;
  blueGold: number;
  redGold: number;
  pos: number;
  neg: number;
  /** True for synthetic zero-crossing points used to keep blue/red area seams crisp. */
  isZeroCrossing?: boolean;
}

export interface BaronMarker {
  id: string;
  minute: number;
  timeLabel: string;
  team: TeamSide;
  diffK: number;
}

export interface GoldTimelineModel {
  /** Frame-sampled curve points (for focus/tooltip and line). */
  frames: GoldCurvePoint[];
  /** Zero-crossing-interpolated curve for clean blue/red area & negative stroke seams. */
  areaPoints: GoldCurvePoint[];
  baronMarkers: BaronMarker[];
  finalDiffK: number;
  finalLabel: string;
  finalTeam: TeamSide | "even";
  peakLeadDiffK: number;
  peakLeadLabel: string;
  peakLeadTimeLabel: string;
  peakLeadTeam: TeamSide | "even";
  durationMinutes: number;
  durationLabel: string;
}

export interface ScoreboardParticipant {
  puuid: string;
  participantId: number;
  teamId: number;
  side: TeamSide;
  displayName: string;
  tagLine: string | null;
  canLinkProfile: boolean;
  championId: string;
  championName: string;
  level: number;
  role: RoleId | null;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: string;
  kdaNumeric: number;
  isDeathHeavy: boolean;
  kp: number;
  damageToChampions: number;
  damageLabel: string;
  damageBarPct: number;
  damageSplit: {
    physical: number;
    magic: number;
    trueDmg: number;
  };
  goldEarned: number;
  goldLabel: string;
  cs: number;
  csPerMinLabel: string;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWards: number;
  items: ResolvedItem[];
  trinket: ResolvedItem;
  isViewedPlayer: boolean;
  isMvp: boolean;
}

export interface ScoreboardTeam {
  teamId: number;
  side: TeamSide;
  label: string;
  win: boolean;
  isRemake: boolean;
  totalKills: number;
  totalGold: number;
  totalGoldLabel: string;
  participants: ScoreboardParticipant[];
}

export interface MatchDetailViewModel {
  matchId: string;
  platform: Platform | null;
  queueId: number;
  queueName: string;
  mapName: string;
  patchLabel: string;
  durationSeconds: number;
  durationLabel: string;
  dateLabel: string;
  isRemake: boolean;
  viewedSide: TeamSide;
  viewedWin: boolean;
  viewedChampionId: string;
  viewedChampionName: string;
  viewedPlayerName: string;
  viewedPlayerTag: string | null;
  isDefaultParticipant: boolean;
  blueTeam: ScoreboardTeam;
  redTeam: ScoreboardTeam;
  objectives: MatchObjectivePair[];
  firstEvents: FirstEventSummary[];
  loadout: ViewedPlayerLoadout;
  goldTimeline: GoldTimelineModel | null;
}

export function encodeReferrerParam(platform: Platform, name: string, tag: string): string {
  return `${platform}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
}

export function parseReferrerParam(raw: string | undefined): MatchReferrer | null {
  if (!raw) {
    return null;
  }
  const cleaned = raw
    .trim()
    .replace(/^\/+/, "")
    .replace(/^summoner\//, "");
  const parts = cleaned.split("/");
  if (parts.length < 3) {
    return null;
  }
  const [platformRaw, nameRaw, ...tagRest] = parts;
  if (!platformRaw || !isPlatform(platformRaw.toLowerCase())) {
    return null;
  }
  try {
    const platform = platformRaw.toLowerCase() as Platform;
    const name = decodeURIComponent(nameRaw ?? "").trim();
    const tag = decodeURIComponent(tagRest.join("/")).trim();
    if (!name || !tag) {
      return null;
    }
    return {
      platform,
      name,
      tag,
      label: `${name}#${tag}`,
    };
  } catch {
    return null;
  }
}

function formatPatchNumber(gameVersion: string | undefined, fallbackVersion: string): string {
  const source = gameVersion || fallbackVersion;
  const parts = source.split(".");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0]}.${parts[1]}`;
  }
  return source;
}

function formatMatchDate(timestampMs: number, nowMs = Date.now()): string {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
    return "—";
  }
  const date = new Date(timestampMs);
  const now = new Date(nowMs);
  const month = MONTH_SHORT[date.getMonth()] ?? "";
  const day = date.getDate();
  if (date.getFullYear() === now.getFullYear()) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${date.getFullYear()}`;
}

function formatSignedGoldK(diffK: number): string {
  if (Math.abs(diffK) < 0.05) {
    return "±0.0k";
  }
  const sign = diffK > 0 ? "+" : "-";
  return `${sign}${Math.abs(diffK).toFixed(1)}k`;
}

function participantNames(p: MatchParticipantDTO): { name: string; tag: string | null } {
  if (p.riotIdGameName && p.riotIdGameName.trim().length > 0) {
    return {
      name: p.riotIdGameName.trim(),
      tag: p.riotIdTagline && p.riotIdTagline.trim().length > 0 ? p.riotIdTagline.trim() : null,
    };
  }
  return {
    name: p.summonerName?.trim() || p.championName,
    tag: null,
  };
}

function computeImpactScore(p: MatchParticipantDTO, teamKills: number, teamDamage: number): number {
  const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
  const kp = teamKills > 0 ? (p.kills + p.assists) / teamKills : 0;
  const dmgShare = teamDamage > 0 ? p.totalDamageDealtToChampions / teamDamage : 0;
  const visionBonus = Math.min(1, p.visionScore / 50) * 0.4;
  return kda * 0.45 + kp * 3.0 + dmgShare * 4.5 + visionBonus;
}

function buildRuneLookup(runes?: RuneStyle[]): {
  stylesById: Map<number, RuneStyle>;
  runesById: Map<number, RuneData>;
} {
  const stylesById = new Map<number, RuneStyle>();
  const runesById = new Map<number, RuneData>();
  if (!runes) {
    return { stylesById, runesById };
  }
  for (const style of runes) {
    stylesById.set(style.id, style);
    for (const slot of style.slots) {
      for (const rune of slot.runes) {
        runesById.set(rune.id, rune);
      }
    }
  }
  return { stylesById, runesById };
}

function resolveItem(itemId: number, items?: Record<string, ItemData>): ResolvedItem {
  if (!itemId || itemId <= 0) {
    return { id: 0, name: null, goldTotal: null };
  }
  const data = items?.[String(itemId)];
  return {
    id: itemId,
    name: data?.name ?? null,
    goldTotal: data?.gold?.total ?? null,
  };
}

function extractSkillOrder(
  timeline: TimelineDTO | null | undefined,
  participantId: number,
): SkillOrderSummary | null {
  const frames = timeline?.info?.frames;
  if (!frames || frames.length === 0) {
    return null;
  }

  const slotToLetter: Record<number, SkillLetter> = {
    1: "Q",
    2: "W",
    3: "E",
    4: "R",
  };

  const sequence: SkillLetter[] = [];
  const counts: Record<BasicSkillLetter, number> = { Q: 0, W: 0, E: 0 };
  const maxedAt: Record<BasicSkillLetter, number> = { Q: 99, W: 99, E: 99 };
  const firstAt: Record<BasicSkillLetter, number> = { Q: 99, W: 99, E: 99 };
  const ultimateLevels: number[] = [];

  for (const frame of frames) {
    if (!frame.events) {
      continue;
    }
    for (const event of frame.events) {
      if (
        event.type !== "SKILL_LEVEL_UP" ||
        event.participantId !== participantId ||
        !event.skillSlot
      ) {
        continue;
      }
      if (event.levelUpType && event.levelUpType !== "NORMAL") {
        continue;
      }
      const letter = slotToLetter[event.skillSlot];
      if (!letter) {
        continue;
      }
      const level = sequence.length + 1;
      sequence.push(letter);

      if (letter === "R") {
        ultimateLevels.push(level);
      } else {
        counts[letter] += 1;
        if (firstAt[letter] === 99) {
          firstAt[letter] = level;
        }
        if (counts[letter] >= 5 && maxedAt[letter] === 99) {
          maxedAt[letter] = level;
        }
      }
    }
  }

  if (sequence.length === 0) {
    return null;
  }

  const priorityOrder: BasicSkillLetter[] = (["Q", "W", "E"] as BasicSkillLetter[]).sort((a, b) => {
    if (maxedAt[a] !== maxedAt[b]) {
      return maxedAt[a] - maxedAt[b];
    }
    if (counts[a] !== counts[b]) {
      return counts[b] - counts[a];
    }
    return firstAt[a] - firstAt[b];
  });

  const priorityLabel = priorityOrder.join(" > ");
  const ultimateLabel = ultimateLevels.length > 0 ? `R at ${ultimateLevels.join("/")}` : null;

  return {
    priorityOrder,
    priorityLabel,
    ultimateLevels,
    ultimateLabel,
    firstThree: sequence.slice(0, 3),
    totalLevels: sequence.length,
  };
}

function extractFirstEvents(
  match: MatchDTO,
  timeline: TimelineDTO | null | undefined,
  blueRawTeam: MatchTeamDTO | undefined,
  redRawTeam: MatchTeamDTO | undefined,
): FirstEventSummary[] {
  const participantTeam = new Map<number, TeamSide>();
  for (const p of match.info.participants) {
    participantTeam.set(p.participantId, p.teamId === 100 ? "blue" : "red");
  }

  let firstBloodTimeMs: number | null = null;
  let firstBloodTeam: TeamSide | null = blueRawTeam?.objectives?.champion?.first
    ? "blue"
    : redRawTeam?.objectives?.champion?.first
      ? "red"
      : null;

  let firstTowerTimeMs: number | null = null;
  let firstTowerTeam: TeamSide | null = blueRawTeam?.objectives?.tower?.first
    ? "blue"
    : redRawTeam?.objectives?.tower?.first
      ? "red"
      : null;

  let firstDragonTimeMs: number | null = null;
  let firstDragonTeam: TeamSide | null = blueRawTeam?.objectives?.dragon?.first
    ? "blue"
    : redRawTeam?.objectives?.dragon?.first
      ? "red"
      : null;

  const frames = timeline?.info?.frames ?? [];
  for (const frame of frames) {
    if (!frame.events) {
      continue;
    }
    for (const event of frame.events) {
      if (firstBloodTimeMs === null && event.type === "CHAMPION_KILL") {
        firstBloodTimeMs = event.timestamp;
        if (!firstBloodTeam && event.killerId) {
          firstBloodTeam = participantTeam.get(event.killerId) ?? null;
        }
      }

      if (
        firstTowerTimeMs === null &&
        event.type === "BUILDING_KILL" &&
        event.buildingType === "TOWER_BUILDING"
      ) {
        firstTowerTimeMs = event.timestamp;
        if (!firstTowerTeam && event.teamId) {
          // In Riot timeline BUILDING_KILL, teamId is the team that lost the tower.
          firstTowerTeam = event.teamId === 100 ? "red" : "blue";
        }
      }

      if (
        firstDragonTimeMs === null &&
        event.type === "ELITE_MONSTER_KILL" &&
        event.monsterType === "DRAGON"
      ) {
        firstDragonTimeMs = event.timestamp;
        if (!firstDragonTeam) {
          if (event.killerTeamId === 100 || event.killerTeamId === 200) {
            firstDragonTeam = event.killerTeamId === 100 ? "blue" : "red";
          } else if (event.killerId) {
            firstDragonTeam = participantTeam.get(event.killerId) ?? null;
          }
        }
      }
    }
  }

  const out: FirstEventSummary[] = [];

  if (firstBloodTeam) {
    out.push({
      id: "blood",
      label: "First blood",
      team: firstBloodTeam,
      timeLabel: firstBloodTimeMs !== null ? formatDuration(firstBloodTimeMs / 1000) : null,
    });
  }

  if (firstTowerTeam) {
    out.push({
      id: "tower",
      label: "First tower",
      team: firstTowerTeam,
      timeLabel: firstTowerTimeMs !== null ? formatDuration(firstTowerTimeMs / 1000) : null,
    });
  }

  if (firstDragonTeam) {
    out.push({
      id: "dragon",
      label: "First dragon",
      team: firstDragonTeam,
      timeLabel: firstDragonTimeMs !== null ? formatDuration(firstDragonTimeMs / 1000) : null,
    });
  }

  return out;
}

function interpolateDiffAtMinute(frames: readonly GoldCurvePoint[], minute: number): number {
  if (frames.length === 0) {
    return 0;
  }
  const first = frames[0]!;
  if (minute <= first.minute) {
    return first.diffK;
  }
  const last = frames[frames.length - 1]!;
  if (minute >= last.minute) {
    return last.diffK;
  }
  for (let i = 1; i < frames.length; i += 1) {
    const prev = frames[i - 1]!;
    const curr = frames[i]!;
    if (minute <= curr.minute) {
      const span = curr.minute - prev.minute;
      if (span <= 0) {
        return curr.diffK;
      }
      const ratio = (minute - prev.minute) / span;
      return Number((prev.diffK + (curr.diffK - prev.diffK) * ratio).toFixed(2));
    }
  }
  return last.diffK;
}

function buildGoldTimelineModel(
  match: MatchDTO,
  timeline: TimelineDTO | null | undefined,
  durationSeconds: number,
): GoldTimelineModel | null {
  const rawFrames = timeline?.info?.frames;
  if (!rawFrames || rawFrames.length < 2) {
    return null;
  }

  const blueIds = new Set<number>();
  const participantTeam = new Map<number, TeamSide>();
  for (const p of match.info.participants) {
    const isBlue = p.teamId === 100;
    if (isBlue) {
      blueIds.add(p.participantId);
    }
    participantTeam.set(p.participantId, isBlue ? "blue" : "red");
  }

  const frames: GoldCurvePoint[] = [];
  for (const frame of rawFrames) {
    let blueGold = 0;
    let redGold = 0;
    for (const pf of Object.values(frame.participantFrames)) {
      if (blueIds.has(pf.participantId)) {
        blueGold += pf.totalGold;
      } else {
        redGold += pf.totalGold;
      }
    }
    const minute = Number((frame.timestamp / 60_000).toFixed(2));
    const diffK = Number(((blueGold - redGold) / 1000).toFixed(2));
    frames.push({
      minute,
      timeLabel: formatDuration(frame.timestamp / 1000),
      diffK,
      blueGold,
      redGold,
      pos: Math.max(0, diffK),
      neg: Math.min(0, diffK),
    });
  }

  // Insert exact zero-crossing points so blue/red area fills and red negative line touch y=0 cleanly
  const areaPoints: GoldCurvePoint[] = [];
  for (let i = 0; i < frames.length; i += 1) {
    const curr = frames[i]!;
    if (i > 0) {
      const prev = frames[i - 1]!;
      if ((prev.diffK > 0 && curr.diffK < 0) || (prev.diffK < 0 && curr.diffK > 0)) {
        const ratio = Math.abs(prev.diffK) / (Math.abs(prev.diffK) + Math.abs(curr.diffK));
        const crossMinute = Number((prev.minute + (curr.minute - prev.minute) * ratio).toFixed(3));
        const crossGold = Math.round(prev.blueGold + (curr.blueGold - prev.blueGold) * ratio);
        areaPoints.push({
          minute: crossMinute,
          timeLabel: formatDuration(crossMinute * 60),
          diffK: 0,
          blueGold: crossGold,
          redGold: crossGold,
          pos: 0,
          neg: 0,
          isZeroCrossing: true,
        });
      }
    }
    areaPoints.push(curr);
  }

  // Extract Baron Nashor markers from ELITE_MONSTER_KILL events
  const baronMarkers: BaronMarker[] = [];
  for (const frame of rawFrames) {
    if (!frame.events) {
      continue;
    }
    for (const event of frame.events) {
      if (event.type !== "ELITE_MONSTER_KILL" || event.monsterType !== "BARON_NASHOR") {
        continue;
      }
      let team: TeamSide = "blue";
      if (event.killerTeamId === 100 || event.killerTeamId === 200) {
        team = event.killerTeamId === 100 ? "blue" : "red";
      } else if (event.killerId) {
        team = participantTeam.get(event.killerId) ?? "blue";
      }
      const minute = Number((event.timestamp / 60_000).toFixed(2));
      baronMarkers.push({
        id: `baron-${event.timestamp}-${baronMarkers.length}`,
        minute,
        timeLabel: formatDuration(event.timestamp / 1000),
        team,
        diffK: interpolateDiffAtMinute(frames, minute),
      });
    }
  }

  let peakPoint = frames[0]!;
  for (const pt of frames) {
    if (Math.abs(pt.diffK) > Math.abs(peakPoint.diffK)) {
      peakPoint = pt;
    }
  }

  const last = frames[frames.length - 1]!;
  const finalTeam: TeamSide | "even" =
    Math.abs(last.diffK) < 0.05 ? "even" : last.diffK > 0 ? "blue" : "red";
  const peakLeadTeam: TeamSide | "even" =
    Math.abs(peakPoint.diffK) < 0.05 ? "even" : peakPoint.diffK > 0 ? "blue" : "red";

  return {
    frames,
    areaPoints,
    baronMarkers,
    finalDiffK: last.diffK,
    finalLabel: formatSignedGoldK(last.diffK),
    finalTeam,
    peakLeadDiffK: peakPoint.diffK,
    peakLeadLabel: formatSignedGoldK(peakPoint.diffK),
    peakLeadTimeLabel: peakPoint.timeLabel,
    peakLeadTeam,
    durationMinutes: Math.max(1, last.minute),
    durationLabel: formatDuration(durationSeconds),
  };
}

export function buildMatchDetailViewModel(
  match: MatchDTO,
  timeline: TimelineDTO | null | undefined,
  lookups: MatchAssetLookups,
  items?: Record<string, ItemData>,
  preferredPuuid?: string | null,
  referrer?: MatchReferrer | null,
): MatchDetailViewModel | null {
  const participants = match.info.participants;
  if (!participants || participants.length === 0) {
    return null;
  }

  const durationSeconds = normalizeDurationSeconds(match.info.gameDuration);
  const durationMin = Math.max(1 / 60, durationSeconds / 60);
  const isRemake = isRemakeDuration(durationSeconds);
  const timestampMs = getMatchTimestampMs(match);
  const platform = platformFromMatchId(match.metadata.matchId);

  // Resolve viewed player: explicit puuid -> referrer Riot ID match -> first participant
  let viewedRaw = preferredPuuid ? participants.find((p) => p.puuid === preferredPuuid) : undefined;
  let isDefaultParticipant = false;

  if (!viewedRaw && referrer) {
    const refName = referrer.name.toLowerCase();
    const refTag = referrer.tag.toLowerCase();
    viewedRaw = participants.find(
      (p) =>
        p.riotIdGameName?.toLowerCase() === refName && p.riotIdTagline?.toLowerCase() === refTag,
    );
  }

  if (!viewedRaw) {
    viewedRaw = participants[0]!;
    isDefaultParticipant = true;
  }

  const blueRawParticipants = participants.filter((p) => p.teamId === 100);
  const redRawParticipants = participants.filter((p) => p.teamId !== 100);

  const blueRawTeam = match.info.teams.find((t) => t.teamId === 100);
  const redRawTeam = match.info.teams.find((t) => t.teamId !== 100);

  const blueTotalKills = blueRawParticipants.reduce((sum, p) => sum + p.kills, 0);
  const redTotalKills = redRawParticipants.reduce((sum, p) => sum + p.kills, 0);
  const blueTotalGold = blueRawParticipants.reduce((sum, p) => sum + p.goldEarned, 0);
  const redTotalGold = redRawParticipants.reduce((sum, p) => sum + p.goldEarned, 0);
  const blueTotalDamage = blueRawParticipants.reduce(
    (sum, p) => sum + p.totalDamageDealtToChampions,
    0,
  );
  const redTotalDamage = redRawParticipants.reduce(
    (sum, p) => sum + p.totalDamageDealtToChampions,
    0,
  );

  const blueWin = blueRawTeam?.win ?? Boolean(blueRawParticipants[0]?.win);
  const redWin = redRawTeam?.win ?? Boolean(redRawParticipants[0]?.win);

  const maxDamageInMatch = Math.max(1, ...participants.map((p) => p.totalDamageDealtToChampions));

  // Single match MVP on winning team (one gold achievement chip per view)
  let mvpPuuid: string | null = null;
  if (!isRemake) {
    const winningGroup = blueWin ? blueRawParticipants : redRawParticipants;
    const winningKills = blueWin ? blueTotalKills : redTotalKills;
    const winningDamage = blueWin ? blueTotalDamage : redTotalDamage;
    let bestScore = -1;
    for (const candidate of winningGroup) {
      const score = computeImpactScore(candidate, winningKills, winningDamage);
      if (score > bestScore) {
        bestScore = score;
        mvpPuuid = candidate.puuid;
      }
    }
  }

  const buildParticipantRow = (
    p: MatchParticipantDTO,
    side: TeamSide,
    teamKills: number,
  ): ScoreboardParticipant => {
    const champ = resolveChampionIdentity(p.championId, p.championName, lookups.champions);
    const { name, tag } = participantNames(p);
    const role = resolveRole(p);
    const kdaNumeric = (p.kills + p.assists) / Math.max(1, p.deaths);
    const kdaRatio = p.deaths === 0 ? "Perfect" : kdaNumeric.toFixed(2);
    const isDeathHeavy =
      p.deaths >= 7 || (p.deaths >= 5 && kdaNumeric < 1.5) || (!p.win && p.deaths >= 6);

    const rawKp =
      p.challenges?.killParticipation !== undefined
        ? p.challenges.killParticipation * 100
        : teamKills > 0
          ? ((p.kills + p.assists) / teamKills) * 100
          : 0;
    const kp = Math.min(100, Math.max(0, Math.round(rawKp)));

    const totalDmgTypes = Math.max(
      1,
      p.physicalDamageDealtToChampions +
        p.magicDamageDealtToChampions +
        p.trueDamageDealtToChampions,
    );
    const physPct = Math.round((p.physicalDamageDealtToChampions / totalDmgTypes) * 100);
    const magicPct = Math.round((p.magicDamageDealtToChampions / totalDmgTypes) * 100);
    const truePct = Math.max(0, 100 - physPct - magicPct);

    const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);

    return {
      puuid: p.puuid,
      participantId: p.participantId,
      teamId: p.teamId,
      side,
      displayName: name,
      tagLine: tag,
      canLinkProfile: Boolean(platform && p.riotIdGameName && p.riotIdTagline),
      championId: champ.id,
      championName: champ.name,
      level: p.champLevel,
      role,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      kdaRatio,
      kdaNumeric,
      isDeathHeavy,
      kp,
      damageToChampions: p.totalDamageDealtToChampions,
      damageLabel: p.totalDamageDealtToChampions.toLocaleString("en-US"),
      damageBarPct: Math.max(
        2,
        Math.round((p.totalDamageDealtToChampions / maxDamageInMatch) * 100),
      ),
      damageSplit: {
        physical: physPct,
        magic: magicPct,
        trueDmg: truePct,
      },
      goldEarned: p.goldEarned,
      goldLabel: formatCompactNumber(p.goldEarned),
      cs,
      csPerMinLabel: `${(cs / durationMin).toFixed(1)}/m`,
      visionScore: p.visionScore,
      wardsPlaced: p.wardsPlaced ?? 0,
      wardsKilled: p.wardsKilled ?? 0,
      controlWards: p.detectorWardsPlaced ?? 0,
      items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].map((id) =>
        resolveItem(id, items),
      ),
      trinket: resolveItem(p.item6, items),
      isViewedPlayer: p.puuid === viewedRaw.puuid,
      isMvp: mvpPuuid === p.puuid,
    };
  };

  const sortTeamRows = (rows: ScoreboardParticipant[]) =>
    [...rows].sort((a, b) => {
      const aOrder = a.role ? ROLE_SORT_ORDER[a.role] : 5;
      const bOrder = b.role ? ROLE_SORT_ORDER[b.role] : 5;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.participantId - b.participantId;
    });

  const blueTeam: ScoreboardTeam = {
    teamId: 100,
    side: "blue",
    label: "Blue team",
    win: blueWin,
    isRemake,
    totalKills: blueTotalKills,
    totalGold: blueTotalGold,
    totalGoldLabel: formatCompactNumber(blueTotalGold),
    participants: sortTeamRows(
      blueRawParticipants.map((p) => buildParticipantRow(p, "blue", blueTotalKills)),
    ),
  };

  const redTeam: ScoreboardTeam = {
    teamId: 200,
    side: "red",
    label: "Red team",
    win: redWin,
    isRemake,
    totalKills: redTotalKills,
    totalGold: redTotalGold,
    totalGoldLabel: formatCompactNumber(redTotalGold),
    participants: sortTeamRows(
      redRawParticipants.map((p) => buildParticipantRow(p, "red", redTotalKills)),
    ),
  };

  const objectives: MatchObjectivePair[] = [
    {
      id: "baron",
      label: "Baron",
      blue: blueRawTeam?.objectives?.baron?.kills ?? 0,
      red: redRawTeam?.objectives?.baron?.kills ?? 0,
    },
    {
      id: "dragon",
      label: "Dragons",
      blue: blueRawTeam?.objectives?.dragon?.kills ?? 0,
      red: redRawTeam?.objectives?.dragon?.kills ?? 0,
    },
    {
      id: "tower",
      label: "Towers",
      blue: blueRawTeam?.objectives?.tower?.kills ?? 0,
      red: redRawTeam?.objectives?.tower?.kills ?? 0,
    },
    {
      id: "voidgrubs",
      label: "Voidgrubs",
      blue: blueRawTeam?.objectives?.horde?.kills ?? 0,
      red: redRawTeam?.objectives?.horde?.kills ?? 0,
    },
    {
      id: "inhibitor",
      label: "Inhibitors",
      blue: blueRawTeam?.objectives?.inhibitor?.kills ?? 0,
      red: redRawTeam?.objectives?.inhibitor?.kills ?? 0,
    },
  ];

  // Build viewed player loadout (runes, spells, skill order, items)
  const { stylesById, runesById } = buildRuneLookup(lookups.runes);
  const primaryStyle = viewedRaw.perks?.styles?.[0];
  const secondaryStyle = viewedRaw.perks?.styles?.[1];
  const primaryTree = primaryStyle ? stylesById.get(primaryStyle.style) : undefined;
  const secondaryTree = secondaryStyle ? stylesById.get(secondaryStyle.style) : undefined;

  const mapSelections = (selections?: { perk: number }[]): ResolvedRune[] =>
    (selections ?? []).map((sel) => {
      const data = runesById.get(sel.perk);
      return {
        id: sel.perk,
        name: data?.name ?? `Rune ${sel.perk}`,
        icon: data?.icon ?? null,
      };
    });

  const primaryResolved = mapSelections(primaryStyle?.selections);
  const secondaryResolved = mapSelections(secondaryStyle?.selections);

  const spell1Data = lookups.spells?.[String(viewedRaw.summoner1Id)];
  const spell2Data = lookups.spells?.[String(viewedRaw.summoner2Id)];

  const viewedChamp = resolveChampionIdentity(
    viewedRaw.championId,
    viewedRaw.championName,
    lookups.champions,
  );
  const viewedIdentity = participantNames(viewedRaw);

  const loadout: ViewedPlayerLoadout = {
    championId: viewedChamp.id,
    championName: viewedChamp.name,
    level: viewedRaw.champLevel,
    role: resolveRole(viewedRaw),
    displayName: viewedIdentity.name,
    tagLine: viewedIdentity.tag,
    primaryTreeName: primaryTree?.name ?? null,
    primaryTreeIcon: primaryTree?.icon ?? null,
    keystone: primaryResolved[0] ?? null,
    primaryRunes: primaryResolved.slice(1),
    secondaryTreeName: secondaryTree?.name ?? null,
    secondaryTreeIcon: secondaryTree?.icon ?? null,
    secondaryRunes: secondaryResolved,
    spells: [
      {
        id: viewedRaw.summoner1Id,
        key: spell1Data?.id ?? null,
        name: spell1Data?.name ?? "Summoner spell",
      },
      {
        id: viewedRaw.summoner2Id,
        key: spell2Data?.id ?? null,
        name: spell2Data?.name ?? "Summoner spell",
      },
    ],
    items: [
      viewedRaw.item0,
      viewedRaw.item1,
      viewedRaw.item2,
      viewedRaw.item3,
      viewedRaw.item4,
      viewedRaw.item5,
    ].map((id) => resolveItem(id, items)),
    trinket: resolveItem(viewedRaw.item6, items),
    skillOrder: extractSkillOrder(timeline, viewedRaw.participantId),
  };

  const firstEvents = extractFirstEvents(match, timeline, blueRawTeam, redRawTeam);
  const goldTimeline = buildGoldTimelineModel(match, timeline, durationSeconds);

  return {
    matchId: match.metadata.matchId,
    platform,
    queueId: match.info.queueId,
    queueName: queueLabel(match.info.queueId),
    mapName: mapLabel(match.info.mapId),
    patchLabel: formatPatchNumber(match.info.gameVersion, lookups.version),
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    dateLabel: formatMatchDate(timestampMs),
    isRemake,
    viewedSide: viewedRaw.teamId === 100 ? "blue" : "red",
    viewedWin: viewedRaw.win,
    viewedChampionId: viewedChamp.id,
    viewedChampionName: viewedChamp.name,
    viewedPlayerName: viewedIdentity.name,
    viewedPlayerTag: viewedIdentity.tag,
    isDefaultParticipant,
    blueTeam,
    redTeam,
    objectives,
    firstEvents,
    loadout,
    goldTimeline,
  };
}
