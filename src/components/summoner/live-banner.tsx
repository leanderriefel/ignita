import * as React from "react";

import type { ChampionIndex } from "../../lib/api/ddragon";
import { queueLabel } from "../../lib/api/queues";
import { formatDuration, resolveChampionIdentity } from "../../lib/match/transform";
import type { LiveGameDTO } from "../../lib/riot/types";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";

export interface LiveBannerProps {
  liveGame: LiveGameDTO;
  puuid: string;
  champions?: ChampionIndex;
  className?: string;
}

function computeElapsedSeconds(liveGame: LiveGameDTO, nowMs: number): number {
  if (liveGame.gameStartTime && liveGame.gameStartTime > 0) {
    return Math.max(0, Math.floor((nowMs - liveGame.gameStartTime) / 1000));
  }
  return Math.max(0, liveGame.gameLength);
}

/**
 * Single-line LIVE status banner rendered above the profile hero whenever
 * useLiveGame detects an active game. Neutral LIVE chip + green dot, zero rosters.
 */
export function LiveBanner({ liveGame, puuid, champions, className }: LiveBannerProps) {
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = computeElapsedSeconds(liveGame, nowMs);
  const queue = liveGame.gameQueueConfigId
    ? queueLabel(liveGame.gameQueueConfigId)
    : liveGame.gameMode;

  const participant = liveGame.participants.find((p) => p.puuid === puuid);
  const championName =
    participant?.championId !== undefined
      ? resolveChampionIdentity(participant.championId, undefined, champions).name
      : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "surface-over-art flex items-center justify-between gap-3 rounded-[8px] px-3.5 py-2 text-[13px] hairline-divider",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Chip variant="live">LIVE</Chip>
        <span className="truncate text-fg font-medium">{queue}</span>
        {championName ? (
          <span className="hidden truncate text-muted-fg sm:inline">· {championName}</span>
        ) : null}
        <span className="shrink-0 text-meta-fg tabular">· {formatDuration(elapsed)}</span>
      </div>

      <span className="shrink-0 text-[13px] text-meta-fg">In game · Spectate</span>
    </div>
  );
}
