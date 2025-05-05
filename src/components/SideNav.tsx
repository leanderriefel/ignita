import { SidebarNotesSelection } from "@/components/SidebarNotesSelection"
import { Sidebar, SidebarProvider } from "@/components/ui/Sidebar"
import { cookies } from "next/headers"

export const SIDEBAR_WIDTH_COOKIE = "sidebarWidth"
export const SIDEBAR_TOGGLED_COOKIE = "sidebarToggled"

export const WithSideNav = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const sidebarWidth = (await cookies()).get(SIDEBAR_WIDTH_COOKIE)?.value
  const sidebarToggled = (await cookies()).get(SIDEBAR_TOGGLED_COOKIE)?.value

  return (
    <SidebarProvider
      widthCookieName={SIDEBAR_WIDTH_COOKIE}
      toggledCookieName={SIDEBAR_TOGGLED_COOKIE}
      widthCookie={sidebarWidth}
      toggledCookie={sidebarToggled}
    >
      <div className="flex h-dvh w-dvw overflow-hidden bg-border/50">
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
