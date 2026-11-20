/**
 * Trimmed-but-honest Riot API DTO types.
 * Riot omits empty values entirely (zeros, empty strings, empty lists), so
 * anything that can realistically be absent is optional. Default missing
 * numbers to 0 at the consumption site.
 */

export interface RiotAccount {
  puuid: string;
  gameName: string | null;
  tagLine: string | null;
}

export interface SummonerDTO {
  id: string;
  accountId?: string;
  puuid: string;
  /** @deprecated by Riot — prefer the Riot ID from account-v1 */
  name?: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface MiniSeriesDTO {
  target: number;
  wins: number;
  losses: number;
  progress: string;
}

export interface LeagueEntryDTO {
  leagueId: string;
  summonerId?: string;
  summonerName?: string;
  puuid?: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDTO;
}

export interface ChampionMasteryDTO {
  puuid?: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  championPointsSinceLastLevel?: number;
  championPointsUntilNextLevel?: number;
  chestGranted?: boolean;
  tokensEarned?: number;
  summonerId?: string;
  lastPlayTime: number;
}

export interface PerkSelectionDTO {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface PerkStyleDTO {
  style: number;
  description: string;
  selections: PerkSelectionDTO[];
}

export interface PerksDTO {
  statPerks?: { offense?: number; flex?: number; defense?: number };
  styles?: PerkStyleDTO[];
}

export interface MatchParticipantDTO {
  // identity
  puuid: string;
  participantId: number;
  teamId: number;
  riotIdGameName?: string;
  riotIdTagline?: string;
  /** @deprecated by Riot */
  summonerName?: string;
  profileIcon?: number;
  // champion
  championId: number;
  championName: string;
  champLevel: number;
  // position (teamPosition is the assigned lane; individualPosition the actual one)
  teamPosition?: string;
  individualPosition?: string;
  lane?: string;
  role?: string;
  // scoreline
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  champExperience?: number;
  // damage
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  damageSelfMitigated?: number;
  magicDamageDealtToChampions: number;
  physicalDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;
  // vision
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  detectorWardsPlaced?: number;
  // items (0 = empty slot)
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  // spells + runes
  summoner1Id: number;
  summoner2Id: number;
  perks?: PerksDTO;
  // result
  win: boolean;
  // challenges (absent on older matches / some queues)
  challenges?: {
    killParticipation?: number;
    teamDamagePercentage?: number;
    damageTakenOnTeamPercentage?: number;
    damagePerMinute?: number;
    goldPerMinute?: number;
    csPerMinute?: number;
    visionScorePerMinute?: number;
    soloKills?: number;
    kda?: number;
    abilityUses?: number;
    dragonTakedowns?: number;
    baronTakedowns?: number;
    [key: string]: number | undefined;
  };
}

export interface TeamObjectivesDTO {
  baron?: { first?: boolean; kills: number };
  champion?: { first?: boolean; kills: number };
  dragon?: { first?: boolean; kills: number };
  horde?: { first?: boolean; kills: number };
  inhibitor?: { first?: boolean; kills: number };
  riftHerald?: { first?: boolean; kills: number };
  tower?: { first?: boolean; kills: number };
}

export interface MatchTeamDTO {
  teamId: number;
  win: boolean;
  bans?: { championId: number; pickTurn: number }[];
  objectives?: TeamObjectivesDTO;
}

export interface MatchInfoDTO {
  gameCreation: number;
  gameStartTimestamp?: number;
  gameEndTimestamp?: number;
  /** seconds in match-v5 (some migrated older matches report ms — sanity-check) */
  gameDuration: number;
  queueId: number;
  mapId?: number;
  gameMode: string;
  gameType: string;
  gameVersion?: string;
  platformId?: string;
  teams: MatchTeamDTO[];
  participants: MatchParticipantDTO[];
}

export interface MatchDTO {
  metadata: {
    dataVersion?: string;
    matchId: string;
    participants: string[];
  };
  info: MatchInfoDTO;
}

export interface TimelineParticipantFrameDTO {
  participantId: number;
  position?: { x: number; y: number };
  currentGold: number;
  totalGold: number;
  goldPerSecond?: number;
  level: number;
  xp: number;
  minionsKilled: number;
  jungleMinionsKilled: number;
  timeEnemySpentControlled?: number;
}

export interface TimelineEventDTO {
  type: string;
  timestamp: number;
  // CHAMPION_KILL
  killerId?: number;
  victimId?: number;
  assistingParticipantIds?: number[];
  position?: { x: number; y: number };
  bounty?: number;
  shutdownBounty?: number;
  killStreakLength?: number;
  // ELITE_MONSTER_KILL
  monsterType?: string;
  monsterSubType?: string;
  // BUILDING_KILL
  buildingType?: string;
  towerType?: string;
  laneType?: string;
  teamId?: number;
  // SKILL_LEVEL_UP
  skillSlot?: number;
  levelUpType?: string;
  // wards
  wardType?: string;
  creatorId?: number;
  // items
  itemId?: number;
  participantId?: number;
}

export interface TimelineDTO {
  metadata: { matchId: string; participants: string[] };
  info: {
    frameInterval?: number;
    frames: {
      timestamp: number;
      events?: TimelineEventDTO[];
      participantFrames: Record<string, TimelineParticipantFrameDTO>;
    }[];
  };
}

export interface LiveGameParticipantDTO {
  puuid?: string;
  championId?: number;
  summonerName?: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  teamId?: number;
  spell1Id?: number;
  spell2Id?: number;
  profileIconId?: number;
  bot?: boolean;
}

export interface LiveGameDTO {
  gameId: number;
  gameStartTime: number;
  /** seconds */
  gameLength: number;
  gameMode: string;
  gameType?: string;
  gameQueueConfigId?: number;
  mapId?: number;
  platformId?: string;
  participants: LiveGameParticipantDTO[];
  bannedChampions?: { championId: number; teamId: number; pickTurn: number }[];
  observer?: { encryptionKey?: string };
}
