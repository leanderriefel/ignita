import { Link, createFileRoute } from "@tanstack/react-router";

import { ArrowLeftIcon, Chip, Skeleton } from "../components/ui";
import { getPlatformInfo, platformFromMatchId } from "../lib/riot/regions";

export const Route = createFileRoute("/match/$matchId")({
  component: MatchPlaceholderPage,
});

function MatchPlaceholderPage() {
  const { matchId } = Route.useParams();
  const detectedPlatform = platformFromMatchId(matchId);
  const platformInfo = detectedPlatform ? getPlatformInfo(detectedPlatform) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-meta-fg transition-colors hover:text-fg"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to search</span>
        </Link>
      </div>

      <section className="flex flex-col gap-4 rounded-[12px] bg-panel p-6 hairline-divider">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-fg tabular">
            {matchId}
          </h1>
          <div className="flex items-center gap-2">
            {platformInfo ? (
              <Chip variant="neutral">
                {platformInfo.short} · {platformInfo.label}
              </Chip>
            ) : null}
            <Chip variant="neutral">Match breakdown · Phase 3</Chip>
          </div>
        </div>

        <p className="pt-2 text-[13px] text-meta-fg hairline-divider-t">
          Objectives, gold advantage timeline, and full blue/red scoreboards ship in Phase 3.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-[12px] bg-panel p-5 hairline-divider">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full opacity-70" />
        </div>
        <div className="flex flex-col gap-3 rounded-[12px] bg-panel p-5 hairline-divider">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full opacity-70" />
        </div>
      </section>
    </div>
  );
}
