import {
  SIDEBAR_TOGGLED_COOKIE,
  SIDEBAR_WIDTH_COOKIE,
} from "../hooks/use-sidebar-storage"

export interface ServerSidebarValues {
  width?: string
  toggled?: string
}

export const getServerSidebarValues =
  async (): Promise<ServerSidebarValues> => {
    try {
      // Dynamic import to avoid module evaluation errors in static builds
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      const width = cookieStore.get(SIDEBAR_WIDTH_COOKIE)?.value
      const toggled = cookieStore.get(SIDEBAR_TOGGLED_COOKIE)?.value

      return { width, toggled }
    } catch {
      // Return empty object if cookies() is not available (static builds)
      return {}
    }
  }
