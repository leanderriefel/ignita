import { NotesTree } from "./notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

interface SideNavProps {
  children: React.ReactNode
  initialWidth?: number
  widthStorageKey?: string
  toggledStorageKey?: string
}

export const WithSideNav = ({
  children,
  initialWidth = 280,
  widthStorageKey = "sidebar-width",
  toggledStorageKey = "sidebar-toggled",
}: SideNavProps) => {
  return (
    <SidebarProvider
      initialWidth={initialWidth}
      widthStorageKey={widthStorageKey}
      toggledStorageKey={toggledStorageKey}
    >
      <div className="bg-border/50 before:to-primary/10 flex h-dvh w-dvw overflow-hidden before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:blur-md">
        <Sidebar className="flex flex-col gap-y-2 py-9">
          <div className="text-center">
            <WorkspaceDropdown />
          </div>
          <div className="grow">
            <NotesTree />
          </div>
        </Sidebar>
        <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-auto rounded-xl border">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
