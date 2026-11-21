import { Link, createFileRoute } from "@tanstack/react-router";

import { ArrowLeftIcon, Chip, MatchRowSkeleton } from "../components/ui";
import { useAccount } from "../lib/api/queries";
import { formatRiotError } from "../lib/riot-id";
import { getPlatformInfo, isPlatform, type Platform } from "../lib/riot/regions";

export const Route = createFileRoute("/summoner/$platform/$name/$tag")({
  component: SummonerPlaceholderPage,
});

function SummonerPlaceholderPage() {
  const { platform, name, tag } = Route.useParams();
  const validPlatform: Platform | null = isPlatform(platform) ? platform : null;
  const platformInfo = validPlatform ? getPlatformInfo(validPlatform) : null;

  const accountQuery = useAccount(validPlatform ?? "kr", name, tag, Boolean(validPlatform));

  const formattedError = accountQuery.error ? formatRiotError(accountQuery.error) : null;

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
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] text-fg sm:text-[32px]">
              {accountQuery.data?.gameName ?? name}
            </h1>
            <span className="text-[20px] font-normal text-meta-fg">
              #{accountQuery.data?.tagLine ?? tag}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Chip variant="neutral">
              {platformInfo ? `${platformInfo.short} · ${platformInfo.label}` : platform}
            </Chip>
            <Chip variant="neutral">Dashboard · Phase 2</Chip>
          </div>
        </div>

        <div className="pt-2 text-[13px] text-meta-fg hairline-divider-t">
          {!validPlatform ? (
            <span className="text-loss">Unknown platform &ldquo;{platform}&rdquo;.</span>
          ) : accountQuery.isFetching ? (
            <span>Resolving Riot account…</span>
          ) : formattedError ? (
            <span className="text-loss">{formattedError.message}</span>
          ) : accountQuery.data ? (
            <span className="tabular">
              Account verified · PUUID {accountQuery.data.puuid.slice(0, 12)}…
            </span>
          ) : (
            <span>Summoner overview, ranked telemetry, and match history ship in Phase 2.</span>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <MatchRowSkeleton opacity={1} />
        <MatchRowSkeleton opacity={0.65} />
        <MatchRowSkeleton opacity={0.35} />
      </section>
    </div>
  );
}
