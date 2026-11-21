import { Link } from "@tanstack/react-router";

import { useRegionPreference } from "../../lib/preferences";
import { getPlatformInfo } from "../../lib/riot/regions";
import { useCommandPalette } from "../command";
import { BrandMark, SearchIcon } from "../ui";

export function TopNav() {
  const { openPalette } = useCommandPalette();
  const [region] = useRegionPreference();
  const activePlatform = getPlatformInfo(region);

  return (
    <header className="nav-scrim sticky top-0 z-40 h-14 w-full hairline-b">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-[6px] text-fg transition-opacity duration-150 hover:opacity-90"
        >
          <BrandMark className="h-[18px] w-[18px] text-fg" />
          <span className="text-[16px] font-semibold tracking-[-0.02em]">Ignita</span>
        </Link>

        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          className="inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-[8px] bg-panel/90 px-3 text-[13px] text-meta-fg hairline transition-[background-color,border-color,color] duration-150 ease-out hover:bg-control hover:text-fg hover:hairline-strong"
        >
          <SearchIcon className="h-3.5 w-3.5 shrink-0 text-meta-fg" />
          <span className="hidden sm:inline">Search Riot ID</span>
          <span className="rounded-[5px] bg-control px-1.5 py-0 text-[13px] leading-[18px] font-medium text-muted-fg tabular hairline">
            {activePlatform.short}
          </span>
          <kbd className="hidden rounded-[5px] bg-section px-1.5 py-0 text-[13px] leading-[18px] font-medium text-meta-fg hairline sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
