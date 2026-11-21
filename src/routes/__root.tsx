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
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type * as React from "react";

import { CommandPalette, CommandPaletteProvider } from "../components/command";
import { Footer } from "../components/layout/footer";
import { TopNav } from "../components/layout/top-nav";
import { Toaster } from "../components/ui";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <MotionConfig reducedMotion="user">
      <CommandPaletteProvider>
        <div className="flex min-h-screen flex-col bg-canvas text-fg">
          <TopNav />
          <div className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.main>
            </AnimatePresence>
          </div>
          <Footer />
          <CommandPalette />
          <Toaster />
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
