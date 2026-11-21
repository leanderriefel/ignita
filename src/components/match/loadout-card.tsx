import { itemIcon, runeIcon, spellIcon } from "../../lib/api/ddragon";
import type { ResolvedItem, ResolvedRune, ViewedPlayerLoadout } from "../../lib/match/detail";
import { cn } from "../ui/cn";
import { ROLE_LABELS, RoleIcon } from "../ui/role-icons";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AssetImage } from "./asset-image";

export interface LoadoutCardProps {
  loadout: ViewedPlayerLoadout;
  version: string;
  timelineLoading?: boolean;
  className?: string;
}

function RuneBadge({ rune, size = "sm" }: { rune: ResolvedRune; size?: "keystone" | "sm" }) {
  const isKeystone = size === "keystone";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            tabIndex={0}
            aria-label={rune.name}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-canvas/85 outline-none hairline",
              isKeystone ? "h-8 w-8 p-0.5" : "h-6 w-6 p-0.5",
            )}
          />
        }
      >
        <AssetImage
          src={rune.icon ? runeIcon(rune.icon) : null}
          alt={rune.name}
          className="h-full w-full rounded-full"
        />
      </TooltipTrigger>
      <TooltipContent>{rune.name}</TooltipContent>
    </Tooltip>
  );
}

function LoadoutItemSlot({
  item,
  version,
  trinket = false,
}: {
  item: ResolvedItem;
  version: string;
  trinket?: boolean;
}) {
  const src = itemIcon(version, item.id);
  const shapeClass = trinket ? "rounded-full" : "rounded-[4px]";

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-9 w-9 shrink-0 bg-empty-slot border-[0.5px] border-empty-slot-border/80",
          shapeClass,
        )}
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            tabIndex={0}
            aria-label={item.name ?? `Item ${item.id}`}
            className={cn("h-9 w-9 shrink-0 overflow-hidden outline-none hairline", shapeClass)}
          />
        }
      >
        <AssetImage src={src} alt={item.name ?? `Item ${item.id}`} className="h-full w-full" />
      </TooltipTrigger>
      <TooltipContent>
        <span>{item.name ?? `Item ${item.id}`}</span>
        {item.goldTotal ? (
          <span className="text-meta-fg tabular">{item.goldTotal.toLocaleString("en-US")}g</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Viewed player's runes, summoner spells, skill max order, and final items.
 * Zero gold accents.
 */
export function LoadoutCard({
  loadout,
  version,
  timelineLoading = false,
  className,
}: LoadoutCardProps) {
  const treeSummary = [loadout.primaryTreeName, loadout.secondaryTreeName]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      aria-label="Loadout"
      className={cn(
        "flex flex-col justify-between gap-5 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">Loadout</h2>
        <div className="inline-flex items-center gap-2 text-[13px] text-meta-fg tabular">
          {loadout.role ? (
            <RoleIcon role={loadout.role} className="h-3.5 w-3.5 text-muted-fg" />
          ) : null}
          <span className="text-fg font-medium">{loadout.championName}</span>
          {loadout.role ? <span>· {ROLE_LABELS[loadout.role]}</span> : null}
          <span>· Lv {loadout.level}</span>
        </div>
      </div>

      {/* Runes + Summoner Spells row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
        {/* Runes */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 text-[13px] text-meta-fg">
            <span>Runes</span>
            {treeSummary ? <span className="truncate">{treeSummary}</span> : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Primary tree: keystone + 3 minor runes */}
            <div className="flex items-center gap-1.5">
              {loadout.keystone ? (
                <RuneBadge rune={loadout.keystone} size="keystone" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-empty-slot border-[0.5px] border-empty-slot-border/80" />
              )}
              {loadout.primaryRunes.map((rune, idx) => (
                <RuneBadge key={`p-${rune.id}-${idx}`} rune={rune} />
              ))}
            </div>

            {loadout.secondaryRunes.length > 0 || loadout.secondaryTreeIcon ? (
              <>
                <div className="h-5 w-px bg-[var(--color-hairline-divider)]" aria-hidden="true" />
                {/* Secondary tree icon + 2 runes */}
                <div className="flex items-center gap-1.5">
                  {loadout.secondaryTreeIcon ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <div
                            tabIndex={0}
                            aria-label={loadout.secondaryTreeName ?? "Secondary rune tree"}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas/60 p-1 outline-none hairline"
                          />
                        }
                      >
                        <AssetImage
                          src={runeIcon(loadout.secondaryTreeIcon)}
                          alt={loadout.secondaryTreeName ?? "Secondary tree"}
                          className="h-full w-full rounded-full opacity-85"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {loadout.secondaryTreeName ?? "Secondary tree"}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {loadout.secondaryRunes.map((rune, idx) => (
                    <RuneBadge key={`s-${rune.id}-${idx}`} rune={rune} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Summoner spells */}
        <div className="flex flex-col gap-2.5 sm:pl-5 sm:hairline-divider-l">
          <span className="text-[13px] text-meta-fg">Spells</span>
          <div className="flex items-center gap-2">
            {loadout.spells.map((spell, idx) => (
              <Tooltip key={`spell-${spell.id}-${idx}`}>
                <TooltipTrigger
                  render={
                    <div
                      tabIndex={0}
                      aria-label={spell.name}
                      className="h-8 w-8 shrink-0 overflow-hidden rounded-[6px] outline-none hairline"
                    />
                  }
                >
                  <AssetImage
                    src={spell.key ? spellIcon(version, spell.key) : null}
                    alt={spell.name}
                    className="h-full w-full"
                  />
                </TooltipTrigger>
                <TooltipContent>{spell.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Skill order + Items */}
      <div className="flex flex-col gap-4 pt-4 hairline-divider-t">
        {/* Skill order summary (13px tabular) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] tabular">
          <span className="text-meta-fg">Skill order</span>

          {timelineLoading ? (
            <Skeleton className="h-3.5 w-36" />
          ) : loadout.skillOrder ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 font-semibold text-fg">
                {loadout.skillOrder.priorityOrder.map((skill, idx) => (
                  <span key={skill} className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] bg-section px-1.5 text-[13px] leading-none text-fg hairline">
                      {skill}
                    </span>
                    {idx < loadout.skillOrder!.priorityOrder.length - 1 ? (
                      <span aria-hidden="true" className="text-border-strong">
                        ›
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
              {loadout.skillOrder.ultimateLabel ? (
                <span className="text-meta-fg">· {loadout.skillOrder.ultimateLabel}</span>
              ) : null}
            </div>
          ) : (
            <span className="text-meta-fg">Timeline unavailable</span>
          )}
        </div>

        {/* Final items strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] text-meta-fg">Items</span>
          <div className="flex items-center gap-1">
            {loadout.items.map((item, idx) => (
              <LoadoutItemSlot
                key={`loadout-item-${idx}-${item.id}`}
                item={item}
                version={version}
              />
            ))}
            <div className="w-1.5 shrink-0" />
            <LoadoutItemSlot item={loadout.trinket} version={version} trinket />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LoadoutCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between gap-5 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3.5 w-28 opacity-65" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton rounded="full" className="h-8 w-8" />
          <Skeleton rounded="full" className="h-6 w-6" />
          <Skeleton rounded="full" className="h-6 w-6" />
          <Skeleton rounded="full" className="h-6 w-6" />
          <Skeleton rounded="full" className="h-6 w-6 opacity-60" />
          <Skeleton rounded="full" className="h-6 w-6 opacity-60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton rounded="sm" className="h-8 w-8" />
          <Skeleton rounded="sm" className="h-8 w-8" />
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4 hairline-divider-t">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 opacity-65" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-14 opacity-65" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} rounded="slot" className="h-9 w-9" />
            ))}
            <div className="w-1.5" />
            <Skeleton rounded="full" className="h-9 w-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
