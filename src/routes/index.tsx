import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

import { TeaserMatchRows } from "../components/landing/teaser-match-rows";
import { SearchCluster } from "../components/ui";
import { championSquare, itemIcon } from "../lib/api/ddragon";
import { useDDragonVersion } from "../lib/api/queries";

const ZED_SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg";
const FALLBACK_VERSION = "16.23.1";
const PREVIEW_ITEMS = [6655, 3020, 4645, 3089, 3157, 0];

export const Route = createFileRoute("/")({ component: LandingPage });

function formatPatch(version: string | undefined): string {
  if (!version) {
    return "16.23";
  }
  const [major, minor] = version.split(".");
  return major && minor ? `${major}.${minor}` : version;
}

function LandingPage() {
  const { data: liveVersion } = useDDragonVersion();
  const version = liveVersion ?? FALLBACK_VERSION;
  const patchLabel = formatPatch(liveVersion);

  return (
    <div className="flex flex-col">
      {/* HERO SECTION — full-bleed Zed splash under dark canvas gradients */}
      <section className="relative overflow-hidden">
        {/* Desktop splash backdrop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
          <img
            src={ZED_SPLASH_URL}
            alt=""
            className="h-full w-full object-cover object-[72%_18%] opacity-55"
          />
          {/* Left-to-right canvas scrim for headline legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #0A0A0B 0%, rgba(10,10,11,0.92) 34%, rgba(10,10,11,0.48) 68%, rgba(10,10,11,0.35) 100%)",
            }}
          />
          {/* Top + bottom fade cleanly into canvas */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,11,0.65) 0%, rgba(10,10,11,0.1) 28%, rgba(10,10,11,0.72) 82%, #0A0A0B 100%)",
            }}
          />
        </div>

        {/* Mobile 390px ~200px top splash band (Mobile Mandate #5) */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative h-[200px] w-full overflow-hidden sm:hidden"
        >
          <img
            src={ZED_SPLASH_URL}
            alt=""
            className="h-full w-full object-cover object-[68%_18%] opacity-65"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,11,0.35) 0%, rgba(10,10,11,0.65) 68%, #0A0A0B 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col justify-between gap-10 px-4 pt-2 pb-12 sm:min-h-[600px] sm:px-6 sm:pt-20 sm:pb-16 lg:flex-row lg:items-end lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="-mt-12 flex max-w-[640px] flex-col gap-5 sm:mt-0"
          >
            <h1 className="text-[40px] leading-[0.98] font-bold tracking-[-0.045em] text-fg sm:text-[64px] lg:text-[84px]">
              Know why
              <br />
              you won.
            </h1>

            <p className="max-w-[460px] text-[16px] leading-[1.45] text-muted-fg">
              Ranked history, gold swings, and build telemetry in one instrument panel.
            </p>

            {/* The ONLY gold moment on the page */}
            <SearchCluster className="pt-2" />
          </motion.div>

          {/* Subtle floating telemetry card over art — zero gold to obey the gold allowance */}
          <motion.aside
            aria-label="Sample match snapshot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="surface-over-art flex w-full flex-col gap-3 rounded-[12px] p-4 hairline sm:max-w-[330px] lg:mb-2"
          >
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-meta-fg">Last game · 2h ago</span>
              <span className="font-semibold text-win tabular">+19 LP</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={championSquare(version, "Ahri")}
                  alt="Ahri"
                  className="h-11 w-11 shrink-0 rounded-[8px] object-cover hairline"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-win">Victory</span>
                  <span className="text-[13px] text-muted-fg tabular">Ahri · Mid · 31:42</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-[20px] font-semibold tracking-[-0.02em] tabular">
                <span className="text-fg">11</span>
                <span className="font-normal text-border-strong">/</span>
                <span className="text-fg">2</span>
                <span className="font-normal text-border-strong">/</span>
                <span className="text-fg">7</span>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-0.5">
              {PREVIEW_ITEMS.map((id, index) => {
                const src = itemIcon(version, id);
                if (!src) {
                  return (
                    <div
                      key={`empty-${index}`}
                      aria-hidden="true"
                      className="h-7 w-7 rounded-[4px] bg-empty-slot border-[0.5px] border-empty-slot-border/80"
                    />
                  );
                }
                return (
                  <img
                    key={id}
                    src={src}
                    alt={`Item ${id}`}
                    loading="lazy"
                    className="h-7 w-7 rounded-[4px] object-cover hairline"
                  />
                );
              })}
            </div>
          </motion.aside>
        </div>
      </section>

      {/* MATCH-ROW TEASER SECTION — starts directly with title (no eyebrow) */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] text-fg sm:text-[36px]">
            Seven lanes. Zero noise.
          </h2>
          <p className="max-w-[380px] text-[13px] text-meta-fg">
            Fixed-width vertical lanes that align game after game. Open any row for the story behind
            the score.
          </p>
        </div>

        <TeaserMatchRows />
      </section>

      {/* NUMBERS STRIP — cohesive single surface with internal hairline dividers */}
      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-2 overflow-hidden rounded-[12px] bg-panel hairline lg:grid-cols-4">
          <StatCell
            label="Matches parsed"
            value="182M"
            context="Ranked games since Season 2024"
            className="hairline-r max-lg:hairline-b"
          />
          <StatCell
            label="Median lookup"
            value="0.38s"
            context="Riot ID to cached match history"
            className="max-lg:hairline-b lg:hairline-r"
          />
          <StatCell
            label="Regions"
            value="16"
            context="KR, EUW, NA, and 13 more"
            className="hairline-r"
          />
          <StatCell
            label="Current patch"
            value={patchLabel}
            context="Live Data Dragon assets"
            liveDot
          />
        </div>
      </section>
    </div>
  );
}

function StatCell({
  label,
  value,
  context,
  liveDot = false,
  className = "",
}: {
  label: string;
  value: string;
  context: string;
  liveDot?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-between gap-3 p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-meta-fg">
        {liveDot ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-win" aria-hidden="true" />
        ) : null}
        <span>{label}</span>
      </div>
      <div className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-fg tabular sm:text-[36px]">
        {value}
      </div>
      <div className="text-[13px] text-meta-fg">{context}</div>
    </div>
  );
}
