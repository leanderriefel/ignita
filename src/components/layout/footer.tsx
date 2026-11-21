import { Link } from "@tanstack/react-router";

import { BrandMark } from "../ui";

export function Footer() {
  return (
    <footer className="mt-16 w-full hairline-t">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2 text-fg transition-opacity duration-150 hover:opacity-85"
        >
          <BrandMark className="h-4 w-4 text-fg" />
          <span className="text-[13px] font-semibold tracking-[-0.01em]">Ignita</span>
        </Link>

        <p className="max-w-[760px] text-[13px] leading-[1.5] text-meta-fg">
          This application isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or
          opinions of Riot Games or anyone officially involved in producing or managing League of
          Legends. League of Legends © Riot Games, Inc.
        </p>
      </div>
    </footer>
  );
}
