import { ChatToggle } from "./ai/chat-sidebar"
import { SettingsDialog } from "./dialogs/settings/settings-dialog"
import { ThemeSelector } from "./theme/theme-selector"
import { SidebarToggle } from "./ui/sidebar"

export const TopNav = () => {
  return (
    <div className="flex h-auto w-full items-center gap-x-2">
      <div className="flex items-center gap-x-2">
        <SidebarToggle />
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <SettingsDialog />
        <ThemeSelector />
        <ChatToggle />
      </div>
    </div>
  )
}
