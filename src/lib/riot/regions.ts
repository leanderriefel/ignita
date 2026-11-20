/**
 * Riot API routing tables.
 * Platform routing values (e.g. euw1) hit platform hosts.
 * Regional routing values (americas / europe / asia / sea) hit regional hosts.
 * Note: EUNE's platform value is `eun1`.
 */

export type Platform =
  | "na1"
  | "br1"
  | "la1"
  | "la2"
  | "euw1"
  | "eun1"
  | "tr1"
  | "ru"
  | "kr"
  | "jp1"
  | "oc1"
  | "ph2"
  | "sg2"
  | "th2"
  | "tw2"
  | "vn2";

export type RegionRoute = "americas" | "europe" | "asia" | "sea";

export interface PlatformInfo {
  id: Platform;
  label: string;
  short: string;
  route: RegionRoute;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: "na1", label: "North America", short: "NA", route: "americas" },
  { id: "euw1", label: "EU West", short: "EUW", route: "europe" },
  { id: "eun1", label: "EU Nordic & East", short: "EUNE", route: "europe" },
  { id: "kr", label: "Korea", short: "KR", route: "asia" },
  { id: "jp1", label: "Japan", short: "JP", route: "asia" },
  { id: "br1", label: "Brazil", short: "BR", route: "americas" },
  { id: "la1", label: "Latin North", short: "LAN", route: "americas" },
  { id: "la2", label: "Latin South", short: "LAS", route: "americas" },
  { id: "oc1", label: "Oceania", short: "OCE", route: "sea" },
  { id: "tr1", label: "Turkey", short: "TR", route: "europe" },
  { id: "ru", label: "Russia", short: "RU", route: "europe" },
  { id: "ph2", label: "Philippines", short: "PH", route: "sea" },
  { id: "sg2", label: "Singapore", short: "SG", route: "sea" },
  { id: "th2", label: "Thailand", short: "TH", route: "sea" },
  { id: "tw2", label: "Taiwan", short: "TW", route: "sea" },
  { id: "vn2", label: "Vietnam", short: "VN", route: "sea" },
];

const platformMap = new Map<string, PlatformInfo>(PLATFORMS.map((p) => [p.id, p]));

export function isPlatform(value: string): value is Platform {
  return platformMap.has(value);
}

export function getPlatformInfo(platform: Platform): PlatformInfo {
  const info = platformMap.get(platform);
  if (!info) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return info;
}

export function regionRouteFor(platform: Platform): RegionRoute {
  return getPlatformInfo(platform).route;
}

export function platformHost(platform: Platform): string {
  return `${platform}.api.riotgames.com`;
}

export function regionalHost(route: RegionRoute): string {
  return `${route}.api.riotgames.com`;
}

/**
 * Match IDs embed the platform they were played on, e.g. `EUW1_1234567890`.
 * The match endpoints must be called on the regional route covering that platform.
 */
export function platformFromMatchId(matchId: string): Platform | null {
  const prefix = matchId.split("_")[0]?.toLowerCase();
  if (prefix && isPlatform(prefix)) {
    return prefix;
  }
  return null;
}
