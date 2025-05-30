"use client"

import { useSidebarStorage } from "./hooks/use-sidebar-storage"
import { SidebarNotesSelection } from "./notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"

interface SideNavClientProps {
  children: React.ReactNode
  initialWidth?: string
  initialToggled?: string
}

export const SideNavClient = ({
  children,
  initialWidth,
  initialToggled,
}: SideNavClientProps) => {
  const { width, toggled, isLoading } = useSidebarStorage({
    defaultWidth: initialWidth ?? "280px",
    defaultToggled: initialToggled ? initialToggled === "true" : false,
  })

  // Show a minimal layout during loading to prevent flickering
  if (isLoading) {
    return (
      <div className="bg-border/50 flex h-dvh w-dvw overflow-hidden">
        <div
          className="flex flex-col gap-y-2 py-9 border-r"
          style={{ width: initialWidth ?? "280px" }}
        >
          <div className="text-center text-lg font-bold">nuotes</div>
        </div>
        <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-scroll rounded-4xl border px-6 py-2">
          {children}
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      widthCookie={width}
      toggledCookie={toggled?.toString()}
      widthCookieName="sidebarWidth"
      toggledCookieName="sidebarToggled"
    >
      <div className="bg-border/50 flex h-dvh w-dvw overflow-hidden">
        <Sidebar className="flex flex-col gap-y-2 py-9">
          <div className="text-center text-lg font-bold">nuotes</div>
          <div className="grow">
            <SidebarNotesSelection />
          </div>
        </Sidebar>
        <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-scroll rounded-4xl border px-6 py-2">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
