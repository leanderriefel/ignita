import type { createAuthClient } from "better-auth/react"

import { AccountDialog } from "./auth/account/account-dialog"
import { ThemeSelector } from "./theme/theme-selector"
import { SidebarToggle } from "./ui/sidebar"

export const TopNav = ({
  authClient,
}: {
  authClient: ReturnType<typeof createAuthClient>
}) => {
  return (
    <div className="flex h-auto w-full items-center gap-x-2">
      <div className="flex items-center gap-x-2">
        <SidebarToggle />
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <AccountDialog authClient={authClient} />
        <ThemeSelector />
      </div>
    </div>
  )
}
