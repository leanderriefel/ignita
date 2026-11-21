/**
 * Static queue + map labels (queue ids are stable across seasons).
 */

export const QUEUE_LABELS: Record<number, string> = {
  0: "Custom",
  400: "Normal Draft",
  420: "Ranked Solo/Duo",
  430: "Blind Pick",
  440: "Ranked Flex",
  450: "ARAM",
  460: "Blind Pick",
  470: "Ranked Flex",
  480: "Swiftplay",
  490: "Quickplay",
  700: "Clash — Summoner's Rift",
  720: "Clash — ARAM",
  760: "ARAM",
  800: "Co-op vs AI",
  810: "Co-op vs AI",
  820: "Co-op vs AI",
  830: "Co-op vs AI",
  840: "Co-op vs AI",
  850: "Co-op vs AI",
  870: "Co-op vs AI",
  880: "Co-op vs AI",
  890: "Co-op vs AI",
  900: "ARURF",
  920: "ARURF",
  1020: "One for All",
  1300: "Nexus Blitz",
  1400: "Ultimate Spellbook",
  1700: "Arena",
  1710: "Arena",
  1720: "Arena",
  1730: "Arena",
  1740: "Arena",
  1900: "Pick URF",
  2000: "Tutorial",
  2010: "Tutorial",
  2020: "Tutorial",
  2300: "Brawl",
  2400: "ARAM Mayhem",
};

export function queueLabel(queueId: number | undefined): string {
  if (queueId === undefined) {
    return "Unknown queue";
  }
  return QUEUE_LABELS[queueId] ?? `Queue ${queueId}`;
}

/** Queue buckets used by the match-history filter bar. */
export const QUEUE_FILTERS = [
  { id: 420, label: "Ranked Solo/Duo" },
  { id: 440, label: "Ranked Flex" },
  { id: 450, label: "ARAM" },
] as const;

export const MAP_LABELS: Record<number, string> = {
  11: "Summoner's Rift",
  12: "Howling Abyss",
  14: "Butcher's Bridge",
  16: "Cosmic Ruins",
  18: "Valoran City Park",
  22: "Rift",
  30: "Arena",
};

export function mapLabel(mapId: number | undefined): string {
  if (mapId === undefined) {
    return "Unknown map";
  }
  return MAP_LABELS[mapId] ?? `Map ${mapId}`;
}
