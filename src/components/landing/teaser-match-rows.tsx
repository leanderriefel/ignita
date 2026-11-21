import { Link } from "@tanstack/react-router";
import * as React from "react";

import { championSquare, itemIcon, runeIcon, spellIcon } from "../../lib/api/ddragon";
import { useDDragonVersion } from "../../lib/api/queries";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { ArrowRightIcon, ChevronDownIcon } from "../ui/icons";

const FALLBACK_DDRAGON_VERSION = "16.23.1";

interface TeaserMatch {
  id: string;
  win: boolean;
  queue: string;
  duration: string;
  ago: string;
  championId: string;
  championName: string;
  level: number;
  spells: [string, string];
  keystoneIcon: string;
  secondaryRuneIcon: string;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: string;
  cs: number;
  csPerMin: string;
  kp: number;
  vision: number;
  items: number[];
  trinket: number;
  opponentId: string;
  opponentName: string;
  lpDelta: number;
  highlights: string[];
  csDiff15: string;
  goldDiff15: string;
  goldEarned: string;
  damageTotal: string;
  damageShare: string;
  damageRank: string;
  damageSplit: {
    magic: number;
    physical: number;
    trueDmg: number;
  };
  goldLeadLabel: string;
  goldLeadAt: string;
  goldCurve: number[];
}

const TEASER_MATCHES: TeaserMatch[] = [
  {
    id: "KR_7184402913",
    win: true,
    queue: "Ranked Solo",
    duration: "31:42",
    ago: "2h ago",
    championId: "Ahri",
    championName: "Ahri",
    level: 17,
    spells: ["SummonerFlash", "SummonerDot"],
    keystoneIcon: "perk-images/Styles/Domination/Electrocute/Electrocute.png",
    secondaryRuneIcon: "perk-images/Styles/7202_Sorcery.png",
    kills: 11,
    deaths: 2,
    assists: 7,
    kdaRatio: "9.00",
    cs: 254,
    csPerMin: "8.0/m",
    kp: 47,
    vision: 21,
    items: [6655, 3020, 4645, 3089, 3157, 0],
    trinket: 3364,
    opponentId: "Syndra",
    opponentName: "Syndra",
    lpDelta: 19,
    highlights: ["First Blood", "Double Kill", "3 solo kills", "Lane won"],
    csDiff15: "+18",
    goldDiff15: "+1,240",
    goldEarned: "14.9k",
    damageTotal: "34,812",
    damageShare: "31% of team",
    damageRank: "#1 of 10",
    damageSplit: { magic: 82, physical: 9, trueDmg: 9 },
    goldLeadLabel: "+8.4k",
    goldLeadAt: "at 31:42",
    goldCurve: [0, 0.2, 0.5, 0.4, 1.1, 0.8, -0.6, 0.3, 1.4, 2.2, 3.5, 4.9, 6.8, 7.9, 8.4],
  },
  {
    id: "KR_7184321104",
    win: false,
    queue: "Ranked Solo",
    duration: "27:10",
    ago: "5h ago",
    championId: "Zed",
    championName: "Zed",
    level: 15,
    spells: ["SummonerFlash", "SummonerDot"],
    keystoneIcon: "perk-images/Styles/Domination/Electrocute/Electrocute.png",
    secondaryRuneIcon: "perk-images/Styles/7201_Precision.png",
    kills: 6,
    deaths: 7,
    assists: 3,
    kdaRatio: "1.29",
    cs: 203,
    csPerMin: "7.5/m",
    kp: 41,
    vision: 14,
    items: [6692, 3158, 6694, 3814, 1038, 0],
    trinket: 3364,
    opponentId: "Orianna",
    opponentName: "Orianna",
    lpDelta: -16,
    highlights: ["Lane even", "Roam kill"],
    csDiff15: "-6",
    goldDiff15: "-310",
    goldEarned: "11.4k",
    damageTotal: "21,940",
    damageShare: "26% of team",
    damageRank: "#3 of 10",
    damageSplit: { magic: 6, physical: 88, trueDmg: 6 },
    goldLeadLabel: "-5.2k",
    goldLeadAt: "at 27:10",
    goldCurve: [0, 0.4, 0.6, -0.2, -0.8, -1.3, -1.9, -2.5, -2.1, -3.4, -4.1, -4.8, -5.2],
  },
  {
    id: "KR_7184210889",
    win: true,
    queue: "Ranked Solo",
    duration: "29:05",
    ago: "7h ago",
    championId: "LeeSin",
    championName: "Lee Sin",
    level: 16,
    spells: ["SummonerFlash", "SummonerSmite"],
    keystoneIcon: "perk-images/Styles/Precision/Conqueror/Conqueror.png",
    secondaryRuneIcon: "perk-images/Styles/7203_Whimsy.png",
    kills: 8,
    deaths: 3,
    assists: 14,
    kdaRatio: "7.33",
    cs: 188,
    csPerMin: "6.5/m",
    kp: 69,
    vision: 32,
    items: [6610, 3047, 6333, 3071, 3026, 0],
    trinket: 3364,
    opponentId: "Sejuani",
    opponentName: "Sejuani",
    lpDelta: 21,
    highlights: ["2 dragons", "Objective control"],
    csDiff15: "+14",
    goldDiff15: "+980",
    goldEarned: "13.2k",
    damageTotal: "19,620",
    damageShare: "22% of team",
    damageRank: "#4 of 10",
    damageSplit: { magic: 11, physical: 84, trueDmg: 5 },
    goldLeadLabel: "+6.1k",
    goldLeadAt: "at 29:05",
    goldCurve: [0, 0.5, 0.9, 1.4, 1.2, 2.0, 2.7, 3.2, 4.1, 4.8, 5.5, 6.1],
  },
];

function AssetImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={cn("bg-empty-slot border-[0.5px] border-empty-slot-border/80", className)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

function MiniGoldSparkline({ values }: { values: number[] }) {
  const width = 340;
  const height = 74;
  const padX = 4;
  const padY = 10;

  const maxAbs = Math.max(2, ...values.map((v) => Math.abs(v)));
  const minVal = -maxAbs * 0.45;
  const maxVal = maxAbs * 1.1;
  const span = maxVal - minVal;

  const mapX = (index: number) =>
    padX + (index / Math.max(1, values.length - 1)) * (width - padX * 2);
  const mapY = (val: number) => padY + (1 - (val - minVal) / span) * (height - padY * 2);

  const zeroY = mapY(0);
  const points = values.map((val, index) => `${mapX(index).toFixed(1)},${mapY(val).toFixed(1)}`);
  const polyline = points.join(" ");
  const lastX = mapX(values.length - 1);
  const lastY = mapY(values[values.length - 1] ?? 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[74px] w-full overflow-visible"
      role="img"
      aria-label="Team gold advantage timeline"
    >
      {/* Subtle horizontal gridline */}
      <line
        x1={padX}
        y1={padY}
        x2={width - padX}
        y2={padY}
        stroke="var(--color-chart-grid)"
        strokeWidth="0.75"
      />
      {/* Dashed zero baseline */}
      <line
        x1={padX}
        y1={zeroY}
        x2={width - padX}
        y2={zeroY}
        stroke="var(--color-chart-zero)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      {/* Area wash */}
      <polygon
        points={`${mapX(0).toFixed(1)},${zeroY.toFixed(1)} ${polyline} ${lastX.toFixed(1)},${zeroY.toFixed(1)}`}
        fill="rgba(255, 255, 255, 0.06)"
      />
      {/* Main neutral line */}
      <polyline
        fill="none"
        stroke="var(--color-chart-line)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polyline}
      />
      {/* Terminal dot — neutral white on landing to keep Search CTA as the single gold */}
      <circle
        cx={lastX}
        cy={lastY}
        r="3"
        fill="var(--color-fg)"
        stroke="var(--color-section)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TeaserRow({
  match,
  version,
  expanded,
  onToggle,
  faded = false,
}: {
  match: TeaserMatch;
  version: string;
  expanded: boolean;
  onToggle: () => void;
  faded?: boolean;
}) {
  const lpText = match.lpDelta > 0 ? `+${match.lpDelta}` : `${match.lpDelta}`;
  const isNegativeDelta = match.lpDelta < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-panel hairline",
        faded && "pointer-events-none select-none",
      )}
    >
      {/* Masked inner content on the 3rd teaser row so fade ends cleanly on the hairline border */}
      <div
        className={cn(
          faded &&
            "[mask-image:linear-gradient(180deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0)_100%)]",
        )}
      >
        {/* Left 3px win/loss LED */}
        <div
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-[3px]", match.win ? "bg-win" : "bg-loss")}
        />

        {/* DESKTOP 8-LANE ROW (1200px lane budget: 144 / 116 / 136 / flex / 222 / 132 / 64 / 44) */}
        <div
          className={cn(
            "hidden h-[92px] items-center gap-6 lg:flex",
            match.win ? "match-row-win" : "match-row-loss",
          )}
        >
          {/* Lane 1: Meta (144px incl. 20px left pad) */}
          <div className="flex w-[144px] shrink-0 flex-col justify-center gap-0.5 pl-5">
            <span
              className={cn(
                "text-[15px] leading-[1.3] font-semibold",
                match.win ? "text-win" : "text-loss",
              )}
            >
              {match.win ? "Victory" : "Defeat"}
            </span>
            <span className="truncate text-[13px] text-muted-fg">{match.queue}</span>
            <span className="text-[13px] text-meta-fg tabular">
              {match.duration} · {match.ago}
            </span>
          </div>

          {/* Lane 2: Champion (116px: 56px portrait + 22px stacked spells + 22px runes) */}
          <div className="flex w-[116px] shrink-0 items-center gap-1.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] hairline">
              <AssetImage
                src={championSquare(version, match.championId)}
                alt={match.championName}
                className="h-full w-full"
              />
              <span className="absolute right-0.5 bottom-0.5 rounded-[4px] bg-canvas/90 px-1 py-0 text-[11px] leading-[15px] font-semibold text-fg tabular">
                {match.level}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {match.spells.map((spell) => (
                <AssetImage
                  key={spell}
                  src={spellIcon(version, spell)}
                  alt={spell}
                  className="h-[22px] w-[22px] rounded-[4px] hairline"
                />
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-canvas/80 p-0.5 hairline">
                <AssetImage
                  src={runeIcon(match.keystoneIcon)}
                  alt="Keystone rune"
                  className="h-full w-full rounded-full"
                />
              </div>
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-canvas/60 p-1 hairline">
                <AssetImage
                  src={runeIcon(match.secondaryRuneIcon)}
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
              <span className={match.win ? "text-fg" : "text-loss"}>{match.deaths}</span>
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
                {match.cs} <span className="text-meta-fg">{match.csPerMin}</span>
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
              src={championSquare(version, match.opponentId)}
              alt={`vs ${match.opponentName}`}
              className="h-8 w-8 shrink-0 rounded-[6px] opacity-85 hairline"
            />
            <div className="flex min-w-0 flex-col gap-0.5 text-[13px]">
              <span className="truncate text-muted-fg">vs {match.opponentName}</span>
              <div className="flex items-center gap-2 text-meta-fg tabular">
                <span className="text-fg">+4</span>
                <span className="opacity-55">+4</span>
              </div>
            </div>
          </div>

          {/* Lane 7: LP (64px right-aligned) */}
          <div className="flex w-[64px] shrink-0 flex-col items-end justify-center tabular">
            <span
              className={cn(
                "text-[16px] leading-[1.25] font-semibold",
                isNegativeDelta ? "text-loss" : "text-win",
              )}
            >
              {lpText}
            </span>
            <span className="text-[13px] text-meta-fg">LP</span>
          </div>

          {/* Lane 8: Expand (44px tap target, left hairline) */}
          <button
            type="button"
            onClick={onToggle}
            disabled={faded}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse match insights" : "Expand match insights"}
            className="flex h-full w-[44px] shrink-0 cursor-pointer items-center justify-center text-muted-fg/70 hairline-l transition-colors duration-150 hover:bg-control/50 hover:text-fg active:bg-control"
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
        <div
          className={cn(
            "flex flex-col gap-3 p-3.5 pl-4 lg:hidden",
            match.win ? "match-row-win" : "match-row-loss",
          )}
        >
          {/* Line 1: Result/time + 40px portrait + KDA + LP + 44px expand target */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] hairline">
                <AssetImage
                  src={championSquare(version, match.championId)}
                  alt={match.championName}
                  className="h-full w-full"
                />
                <span className="absolute right-0.5 bottom-0.5 rounded-[3px] bg-canvas/90 px-1 text-[10px] leading-[13px] font-semibold text-fg tabular">
                  {match.level}
                </span>
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5 text-[13px]">
                  <span className={cn("font-semibold", match.win ? "text-win" : "text-loss")}>
                    {match.win ? "Victory" : "Defeat"}
                  </span>
                  <span className="text-meta-fg tabular">· {match.duration}</span>
                </div>
                <div className="flex items-baseline gap-1 text-[16px] leading-[1.2] font-semibold tabular">
                  <span className="text-fg">{match.kills}</span>
                  <span className="font-normal text-border-strong">/</span>
                  <span className={match.win ? "text-fg" : "text-loss"}>{match.deaths}</span>
                  <span className="font-normal text-border-strong">/</span>
                  <span className="text-fg">{match.assists}</span>
                  <span className="ml-1 text-[13px] font-normal text-meta-fg">
                    {match.kdaRatio}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span
                className={cn(
                  "text-[13px] font-semibold tabular",
                  isNegativeDelta ? "text-loss" : "text-win",
                )}
              >
                {lpText} LP
              </span>
              <button
                type="button"
                onClick={onToggle}
                disabled={faded}
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
          <div className="flex items-center gap-1.5">
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

        {/* EXPANDED 3-COLUMN INSIGHT STRIP */}
        {expanded && !faded ? (
          <div className="grid grid-cols-1 bg-section/90 hairline-t lg:grid-cols-3">
            {/* Column 1: Highlights & lane deltas */}
            <div className="flex flex-col justify-between gap-4 p-5 max-lg:hairline-b lg:hairline-r">
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
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-meta-fg">CS diff @15</span>
                  <span
                    className={cn(
                      "text-[16px] font-semibold",
                      match.csDiff15.startsWith("-") ? "text-loss" : "text-win",
                    )}
                  >
                    {match.csDiff15}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-meta-fg">Gold diff @15</span>
                  <span
                    className={cn(
                      "text-[16px] font-semibold",
                      match.goldDiff15.startsWith("-") ? "text-loss" : "text-win",
                    )}
                  >
                    {match.goldDiff15}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-meta-fg">Gold</span>
                  <span className="text-[16px] font-semibold text-fg">{match.goldEarned}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Mini team gold advantage chart */}
            <div className="flex flex-col justify-between gap-3 p-5 max-lg:hairline-b lg:hairline-r">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-meta-fg">Team gold advantage</span>
                <span className="text-[13px] tabular">
                  <span
                    className={cn(
                      "font-semibold",
                      match.goldLeadLabel.startsWith("-") ? "text-loss" : "text-win",
                    )}
                  >
                    {match.goldLeadLabel}
                  </span>{" "}
                  <span className="text-meta-fg">{match.goldLeadAt}</span>
                </span>
              </div>

              <MiniGoldSparkline values={match.goldCurve} />

              <div className="flex items-center justify-between text-[13px] text-meta-fg tabular">
                <span>0m</span>
                <span>15m</span>
                <span>{match.duration.split(":")[0]}m</span>
              </div>
            </div>

            {/* Column 3: Damage breakdown (94% / 62% / 40% neutral greys) */}
            <div className="flex flex-col justify-between gap-3 p-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-meta-fg">Damage to champions</span>
                <span className="text-[13px] text-meta-fg tabular">{match.damageRank}</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 tabular">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-fg">
                    {match.damageTotal}
                  </span>
                  <span className="text-[13px] text-meta-fg">{match.damageShare}</span>
                </div>

                {/* Flat neutral-grey segmented bar with 2px gaps */}
                <div className="mt-2.5 flex h-1.5 w-full gap-[2px] overflow-hidden rounded-[2px]">
                  <div
                    style={{ width: `${match.damageSplit.magic}%` }}
                    className="h-full bg-dmg-magic"
                  />
                  <div
                    style={{ width: `${match.damageSplit.physical}%` }}
                    className="h-full bg-dmg-physical"
                  />
                  <div
                    style={{ width: `${match.damageSplit.trueDmg}%` }}
                    className="h-full bg-dmg-true"
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-meta-fg tabular">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-dmg-magic" aria-hidden="true" />
                    Magic <span className="text-fg">{match.damageSplit.magic}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-dmg-physical" aria-hidden="true" />
                    Phys <span className="text-fg">{match.damageSplit.physical}%</span>
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
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg transition-opacity duration-150 hover:opacity-80"
                >
                  <span>Open full match</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TeaserMatchRows() {
  const { data: liveVersion } = useDDragonVersion();
  const version = liveVersion ?? FALLBACK_DDRAGON_VERSION;
  const [expandedId, setExpandedId] = React.useState<string | null>(TEASER_MATCHES[0].id);

  return (
    <div className="flex flex-col gap-2.5">
      {TEASER_MATCHES.map((match, index) => (
        <TeaserRow
          key={match.id}
          match={match}
          version={version}
          expanded={expandedId === match.id}
          faded={index === 2}
          onToggle={() => setExpandedId((prev) => (prev === match.id ? null : match.id))}
        />
      ))}
    </div>
  );
}
