import type { QueryClient } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { MotionConfig } from "motion/react";
import type * as React from "react";

import { CommandPalette, CommandPaletteProvider } from "../components/command";
import { Footer } from "../components/layout/footer";
import { TopNav } from "../components/layout/top-nav";
import { HydrationMarker, Toaster } from "../components/ui";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { usePersistedQueryCache } from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

const SITE_URL = "https://ignita.app";
const SITE_TITLE = "Ignita — League match history";
const SITE_DESCRIPTION =
  "Dark, fast League of Legends match history, LP trajectory, gold swings, and build telemetry.";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "theme-color", content: "#0A0A0B" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ignita" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Ignita — every ranked match, read at a glance." },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:image", content: `${SITE_URL}/og.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // Restores the persisted query cache after hydration (see the hook docs).
  usePersistedQueryCache();

  return (
    <MotionConfig reducedMotion="user">
      <CommandPaletteProvider>
        <div className="flex min-h-screen flex-col bg-canvas text-fg">
          <TopNav />
          <div className="flex-1">
            {/* Keyed CSS page fade (220ms, 4px). No AnimatePresence here on purpose: an
                AnimatePresence initial={false} ancestor blocks every nested motion entrance
                for the lifetime of the first route, which is why lists never animated. */}
            <main key={pathname} className="page-enter">
              <Outlet />
            </main>
          </div>
          <Footer />
          <CommandPalette />
          <Toaster />
          <HydrationMarker />
        </div>
      </CommandPaletteProvider>
    </MotionConfig>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-canvas text-fg antialiased">
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
