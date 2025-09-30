import { MenuIcon } from "lucide-react"

import { ChatToggle } from "./ai/chat-sidebar"
import { SettingsDialog } from "./dialogs/settings/settings-dialog"
import { FlameIcon } from "./icons/flame"
import { Button } from "./ui/button"
import { SidebarToggle } from "./ui/sidebar"
import { useMobilePanels } from "./windows"

export const TopNav = () => {
  const mobilePanels = useMobilePanels()
  return (
    <div className="flex h-auto w-full items-center gap-x-2">
      <div className="flex items-center gap-x-2">
        {/* Desktop: resizable notes sidebar toggle */}
        <div className="hidden xl:block">
          <SidebarToggle />
        </div>
        {/* Mobile: open notes sheet */}
        <div className="block xl:hidden">
          <Button
            onClick={() => mobilePanels.openNotes()}
            variant="outline"
            size="square"
          >
            <MenuIcon className="size-4" />
          </Button>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <SettingsDialog />
        {/* Desktop: AI chat sidebar toggle */}
        <div className="hidden xl:block">
          <ChatToggle />
        </div>
        {/* Mobile: open chat sheet */}
        <div className="block xl:hidden">
          <Button
            onClick={() => mobilePanels.openChat()}
            variant="primary"
            size="square"
            className="bg-gradient-to-b from-primary-darker/60 to-primary-lighter/30 text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <FlameIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
