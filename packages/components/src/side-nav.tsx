import {
  SIDEBAR_TOGGLED_COOKIE,
  SIDEBAR_WIDTH_COOKIE,
} from "./hooks/use-sidebar-storage"
import { getServerSidebarValues } from "./lib/sidebar-server-storage"
import { SideNavClient } from "./side-nav-client"

export { SIDEBAR_WIDTH_COOKIE, SIDEBAR_TOGGLED_COOKIE }

export const WithSideNav = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  // Try to get initial values from cookies during SSR
  // This will gracefully fail in static builds and return empty object
  const { width, toggled } = await getServerSidebarValues()

  return (
    <SideNavClient initialWidth={width} initialToggled={toggled}>
      {children}
    </SideNavClient>
  )
}
