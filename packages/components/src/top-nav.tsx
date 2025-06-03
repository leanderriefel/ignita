import type { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import type { createAuthClient } from "better-auth/react"

import { AccountDialog } from "./dialogs/account-dialog"
import { ThemeSelector } from "./theme-selector"
import { SidebarToggle } from "./ui/sidebar"

export const TopNav = ({
  authClient,
  authHooks,
}: {
  authClient: ReturnType<typeof createAuthClient>
  authHooks: ReturnType<typeof createAuthHooks>
}) => {
  return (
    <div className="flex h-auto w-full items-center gap-x-2">
      <div className="flex items-center gap-x-2">
        <SidebarToggle />
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <AccountDialog authClient={authClient} authHooks={authHooks} />
        <ThemeSelector />
      </div>
    </div>
  )
}
