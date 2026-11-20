/**
 * Data Dragon static data (public CDN — no API key, no rate budget).
 * The version is resolved once per page load and pinned for all asset URLs.
 * TanStack Query caches the JSON aggressively (see queries.ts: 7+ days).
 */

const DD = "https://ddragon.leagueoflegends.com";

export async function fetchVersions(): Promise<string[]> {
  const res = await fetch(`${DD}/api/versions.json`);
  if (!res.ok) {
    throw new Error(`versions.json failed with status ${res.status}`);
  }
  return res.json();
}

export interface ChampionData {
  id: string; // string id, e.g. "Ahri"
  key: string; // numeric id as string, e.g. "103"
  name: string;
  title: string;
  tags?: string[];
  partype?: string;
  blurb?: string;
}

export interface ChampionIndex {
  /** numeric championId (as string) → champion */
  byNumericKey: Record<string, ChampionData>;
  /** string id, e.g. "Ahri" → champion */
  byStringId: Record<string, ChampionData>;
}

export async function fetchChampions(version: string): Promise<ChampionIndex> {
  const res = await fetch(`${DD}/cdn/${version}/data/en_US/champion.json`);
  if (!res.ok) {
    throw new Error(`champion.json failed with status ${res.status}`);
  }
  const body = (await res.json()) as { data: Record<string, ChampionData & { key: string }> };
  const index: ChampionIndex = { byNumericKey: {}, byStringId: {} };
  for (const [stringId, champion] of Object.entries(body.data)) {
    index.byStringId[stringId] = champion;
    index.byNumericKey[champion.key] = champion;
  }
  return index;
}

export interface ItemData {
  name: string;
  description: string;
  plaintext?: string;
  tags?: string[];
  gold?: { base?: number; total: number; sell: number; purchasable?: boolean };
}

export async function fetchItems(version: string): Promise<Record<string, ItemData>> {
  const res = await fetch(`${DD}/cdn/${version}/data/en_US/item.json`);
  if (!res.ok) {
    throw new Error(`item.json failed with status ${res.status}`);
  }
  const body = (await res.json()) as { data: Record<string, ItemData> };
  return body.data;
}

export interface SpellData {
  id: string;
  name: string;
  description: string;
  key: string; // image key, e.g. "SummonerFlash"
  summonerLevel?: number;
  modes?: string[];
}

/** Summoner spells — keyed by numeric id as string, e.g. "4" → Flash. */
export async function fetchSpells(version: string): Promise<Record<string, SpellData>> {
  const res = await fetch(`${DD}/cdn/${version}/data/en_US/summoner.json`);
  if (!res.ok) {
    throw new Error(`summoner.json failed with status ${res.status}`);
  }
  const body = (await res.json()) as { data: Record<string, SpellData & { key: string }> };
  const out: Record<string, SpellData> = {};
  for (const spell of Object.values(body.data)) {
    out[spell.key] = spell;
  }
  return out;
}

export interface RuneData {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

export interface RuneStyle {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: { runes: RuneData[] }[];
}

/** Runes reforged tree (unversioned CDN path). */
export async function fetchRunes(): Promise<RuneStyle[]> {
  const res = await fetch(`${DD}/cdn/data/en_US/runesReforged.json`);
  if (!res.ok) {
    throw new Error(`runesReforged.json failed with status ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Asset URL builders
// ---------------------------------------------------------------------------

export const championSquare = (version: string, championStringId: string) =>
  `${DD}/cdn/${version}/img/champion/${championStringId}.png`;

export const championSplash = (championStringId: string, skin = 0) =>
  `${DD}/cdn/img/champion/splash/${championStringId}_${skin}.jpg`;

export const championLoading = (championStringId: string, skin = 0) =>
  `${DD}/cdn/img/champion/loading/${championStringId}_${skin}.jpg`;

export const itemIcon = (version: string, itemId: number) =>
  itemId > 0 ? `${DD}/cdn/${version}/img/item/${itemId}.png` : null;

export const profileIcon = (version: string, iconId: number) =>
  `${DD}/cdn/${version}/img/profileicon/${iconId}.png`;

export const spellIcon = (version: string, spellKey: string) =>
  `${DD}/cdn/${version}/img/spell/${spellKey}.png`;

/** Rune `icon` fields are unversioned paths like `perk-images/Styles/...`. */
export const runeIcon = (icon: string) => `${DD}/cdn/img/${icon}`;
