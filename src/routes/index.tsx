import { createFileRoute } from "@tanstack/react-router";
import type * as React from "react";

import { Reveal, SearchCluster } from "../components/ui";
import { useDDragonVersion } from "../lib/api/queries";
import { PLATFORMS } from "../lib/riot/regions";

const ZED_SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg";

export const Route = createFileRoute("/")({ component: LandingPage });

function formatPatch(version: string | undefined): string | null {
  if (!version) {
    return null;
  }
  const [major, minor] = version.split(".");
  return major && minor ? `${major}.${minor}` : version;
}

function LandingPage() {
  const { data: liveVersion } = useDDragonVersion();
  const patch = formatPatch(liveVersion);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        {/* Quiet art: desaturated, low-opacity, masked into the canvas (no scrim washes) */}
        <div
          aria-hidden="true"
          className="landing-art pointer-events-none absolute inset-x-0 top-0 h-[260px] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[68%]"
        >
          <img
            src={ZED_SPLASH_URL}
            alt=""
            decoding="async"
            className="h-full w-full object-cover object-[68%_22%]"
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-[168px] pb-14 sm:min-h-[520px] sm:justify-center sm:px-6 sm:pt-20 sm:pb-20">
          <h1
            className="enter-hero text-[32px] leading-[1.08] font-semibold tracking-[-0.035em] text-fg sm:text-[48px]"
            style={{ "--enter-delay": "0ms" } as React.CSSProperties}
          >
            Know why you won.
          </h1>

          <p
            className="enter-hero mt-3 text-[16px] leading-[1.45] text-muted-fg"
            style={{ "--enter-delay": "60ms" } as React.CSSProperties}
          >
            Every ranked match, read at a glance.
          </p>

          {/* The view's single gold moment */}
          <div
            className="enter-hero mt-8"
            style={{ "--enter-delay": "120ms" } as React.CSSProperties}
          >
            <SearchCluster />
          </div>
        </div>
      </section>

      {/* Facts only — nothing invented */}
      <Reveal className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <dl className="grid grid-cols-1 hairline-divider-t sm:grid-cols-3">
          <Fact label="Regions" value={`${PLATFORMS.length}`} />
          <Fact
            label="Patch"
            value={patch ?? "—"}
            live={Boolean(patch)}
            className="max-sm:hairline-divider-t sm:hairline-divider-l sm:pl-6"
          />
          <Fact
            label="Tracking"
            value="None"
            className="max-sm:hairline-divider-t sm:hairline-divider-l sm:pl-6"
          />
        </dl>
      </Reveal>
    </div>
  );
}

function Fact({
  label,
  value,
  live,
  className = "",
}: {
  label: string;
  value: string;
  /** undefined = no status dot; false = idle dot (reserved so nothing shifts when data lands). */
  live?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-5 sm:flex-col sm:gap-1.5 ${className}`}
    >
      <dt className="text-[13px] text-meta-fg">{label}</dt>
      <dd className="m-0 inline-flex items-center gap-2 text-[16px] leading-[1.25] font-semibold tracking-[-0.01em] text-fg tabular">
        {live === undefined ? null : (
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${live ? "bg-win" : "bg-border-strong"}`}
          />
        )}
        <span className="min-w-[3ch]">{value}</span>
      </dd>
    </div>
  );
}
