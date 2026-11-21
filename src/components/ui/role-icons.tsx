import type * as React from "react";

export type RoleId = "top" | "jungle" | "mid" | "bot" | "support";

export const ROLE_LABELS: Record<RoleId, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
};

export interface RoleIconProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  role: RoleId;
}

/**
 * Inline League of Legends position glyphs (Top, Jungle, Mid, Bot, Support).
 * Fill is always overridden via `currentColor` — never gold.
 */
export function RoleIcon({ role, className = "h-[14px] w-[14px]", ...props }: RoleIconProps) {
  switch (role) {
    case "top":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
          {...props}
        >
          <path d="M3 3h16.5l-3.2 3.2H6.2v10.1L3 19.5V3Z" />
          <path d="M9.5 9.5h5v5h-5v-5Z" fillOpacity="0.32" />
          <path d="M21 21H4.5l3.2-3.2h10.1V7.7L21 4.5V21Z" fillOpacity="0.32" />
        </svg>
      );
    case "jungle":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
          {...props}
        >
          <path d="M12 2.5c2.2 3.1 3.3 6.3 2.5 10.2-.4 2-1.2 4.1-2.5 8.8-1.3-4.7-2.1-6.8-2.5-8.8C8.7 8.8 9.8 5.6 12 2.5Z" />
          <path d="M4.2 6.8c2.6 1.5 4.4 3.7 5.2 6.8.5 1.8.6 3.5.4 5.9-1.9-1.7-3.4-3.7-4.4-5.9-1-2.2-1.4-4.5-1.2-6.8Z" />
          <path d="M19.8 6.8c-2.6 1.5-4.4 3.7-5.2 6.8-.5 1.8-.6 3.5-.4 5.9 1.9-1.7 3.4-3.7 4.4-5.9 1-2.2 1.4-4.5 1.2-6.8Z" />
        </svg>
      );
    case "mid":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
          {...props}
        >
          <path d="M17.8 3H21v3.2L6.2 21H3v-3.2L17.8 3Z" />
          <path d="M3 3h10.2L10 6.2H6.2V10L3 13.2V3Z" fillOpacity="0.32" />
          <path d="M21 21H10.8L14 17.8h3.8V14L21 10.8V21Z" fillOpacity="0.32" />
        </svg>
      );
    case "bot":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
          {...props}
        >
          <path d="M21 21H4.5l3.2-3.2h10.1V7.7L21 4.5V21Z" />
          <path d="M9.5 9.5h5v5h-5v-5Z" fillOpacity="0.32" />
          <path d="M3 3h16.5l-3.2 3.2H6.2v10.1L3 19.5V3Z" fillOpacity="0.32" />
        </svg>
      );
    case "support":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
          {...props}
        >
          <path d="M12 3 9.2 7.2 12 10.5l2.8-3.3L12 3Z" />
          <path d="M2 8.2h6.8l1.6 3.4-3.5 1.6-1.1-2H3.6L2 8.2Z" />
          <path d="M22 8.2h-6.8l-1.6 3.4 3.5 1.6 1.1-2h2.2l1.6-3Z" />
          <path d="M12 11.4 9.5 14l2.5 7 2.5-7-2.5-2.6Z" />
        </svg>
      );
  }
}
