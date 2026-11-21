import * as React from "react";

import { cn } from "../ui/cn";

export type RankTier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "emerald"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger"
  | "unranked";

const VALID_TIERS = new Set<RankTier>([
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "master",
  "grandmaster",
  "challenger",
  "unranked",
]);

export function normalizeTier(raw: string | undefined): RankTier {
  const lower = (raw ?? "").toLowerCase() as RankTier;
  return VALID_TIERS.has(lower) ? lower : "unranked";
}

export function formatTierName(tier: RankTier, division?: string): string {
  if (tier === "unranked") {
    return "Unranked";
  }
  const title = tier.charAt(0).toUpperCase() + tier.slice(1);
  const isApex = tier === "master" || tier === "grandmaster" || tier === "challenger";
  if (isApex || !division) {
    return title;
  }
  return `${title} ${division}`;
}

export const RANK_DOT_CLASSES: Record<RankTier, string> = {
  iron: "bg-rank-iron",
  bronze: "bg-rank-bronze",
  silver: "bg-rank-silver",
  gold: "bg-rank-gold",
  platinum: "bg-rank-platinum",
  emerald: "bg-rank-emerald",
  diamond: "bg-rank-diamond",
  master: "bg-rank-master",
  grandmaster: "bg-rank-grandmaster",
  challenger: "bg-rank-challenger",
  unranked: "bg-border-strong",
};

export function rankCrestUrl(tier: RankTier): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier}.png`;
}

export interface RankCrestProps {
  tier: string | undefined;
  size?: number;
  className?: string;
}

/**
 * Real Riot Community Dragon rank crest artwork, tone-matched to dark surfaces
 * (brightness 92% / saturate 94%, object-contain). Exempt from gold allowance as real art.
 */
export function RankCrest({ tier, size = 56, className }: RankCrestProps) {
  const normalized = normalizeTier(tier);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [normalized]);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[8px] bg-section hairline-divider",
          className,
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full", RANK_DOT_CLASSES[normalized])} />
      </div>
    );
  }

  return (
    <img
      src={rankCrestUrl(normalized)}
      alt={`${formatTierName(normalized)} crest`}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        filter: "brightness(92%) saturate(94%)",
      }}
      className={cn("shrink-0 object-contain select-none", className)}
    />
  );
}
