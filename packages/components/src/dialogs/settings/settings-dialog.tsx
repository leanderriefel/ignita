"use client"

import { useRef, useState } from "react"
import { MenuIcon, XIcon } from "lucide-react"
import { VisuallyHidden } from "radix-ui"
import { useSearchParams } from "react-router"

import { cn } from "@ignita/lib"

import { useAuthClient } from "../../auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet"
import { Toggle } from "../../ui/toggle"
import { AccountsTab } from "./tabs/account"
import { AiTab } from "./tabs/ai"
import { GeneralTab } from "./tabs/general"

const tabs = [
  {
    label: "General",
    id: "general",
    component: <GeneralTab />,
  },
  {
    label: "Account",
    id: "account",
    component: <AccountsTab />,
  },
  {
    label: "AI",
    id: "ai",
    component: <AiTab />,
  },
] as const

const defaultTab = tabs[0]

type TabId = (typeof tabs)[number]["id"]

const SettingsDialogTrigger = () => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  return (
    <DialogTrigger asChild>
      <Button size="square" variant="ghost">
        <Avatar>
          <AvatarImage src={session?.user.image ?? undefined} />
          <AvatarFallback>
            {session?.user.name?.slice(0, 2).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DialogTrigger>
  )
}

const TabsSelector = ({
  open,
  setOpen,
}: {
  open: TabId | null
  setOpen: (open: TabId | null) => void
}) => {
  return (
    <>
      {tabs.map((tab) => (
        <Toggle
          key={tab.id}
          size="sm"
          className={cn(
            "w-full justify-start px-4 shadow-none",
            "data-[state=on]:text-primary",
          )}
          pressed={open === tab.id}
          onPressedChange={() => setOpen(tab.id)}
        >
          {tab.label}
        </Toggle>
      ))}
    </>
  )
}

export const SettingsDialog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const open = !!searchParams.get("settings")
    ? tabs.some((tab) => tab.id === searchParams.get("settings"))
      ? (searchParams.get("settings") as TabId)
      : defaultTab.id
    : null

  const [selectorSheetOpen, setSelectorSheetOpen] = useState(false)
  const sheetContainerRef = useRef<HTMLDivElement>(null)

  const setOpen = (open: TabId | null) => {
    if (open) {
      searchParams.set("settings", open)
    } else {
      searchParams.delete("settings")
    }
    setSearchParams(searchParams)
  }

  return (
    <Dialog
      open={!!open}
      onOpenChange={(open) => setOpen(open ? defaultTab.id : null)}
    >
      <SettingsDialogTrigger />
      <DialogContent
        tabIndex={-1}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex w-full max-w-4xl! flex-col gap-0 overflow-hidden rounded-2xl p-0 focus:outline-none xs:flex-row",
        )}
        close={{ className: "max-xs:hidden" }}
      >
        <VisuallyHidden.VisuallyHidden>
          <DialogTitle>
            {tabs.find((tab) => tab.id === open)?.label ?? defaultTab.label}
          </DialogTitle>
        </VisuallyHidden.VisuallyHidden>

        <div
          className="flex items-center justify-between border-b bg-muted/50 p-4 xs:hidden"
          id="settings-dialog-sheet-container"
          ref={sheetContainerRef}
        >
          <Sheet
            modal={false}
            open={selectorSheetOpen}
            onOpenChange={setSelectorSheetOpen}
          >
            <SheetTrigger asChild>
              <Button size="square" variant="ghost">
                <MenuIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="flex max-w-52 flex-col items-center gap-y-2 p-4 xs:hidden"
              side="left"
              portal={{
                container: sheetContainerRef.current ?? undefined,
              }}
              close={{ className: "hidden" }}
            >
              <VisuallyHidden.VisuallyHidden>
                <DialogTitle>
                  {tabs.find((tab) => tab.id === open)?.label ??
                    defaultTab.label}
                </DialogTitle>
              </VisuallyHidden.VisuallyHidden>
              <TabsSelector
                open={open}
                setOpen={(tabId) => {
                  if (tabId) {
                    setOpen(tabId)
                    setSelectorSheetOpen(false)
                  }
                }}
              />
            </SheetContent>
          </Sheet>
          <DialogClose
            asChild
            onClick={() => {
              setSelectorSheetOpen(false)
              setOpen(null)
            }}
          >
            <Button size="square" variant="ghost" className="size-9">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>

        <div className="hidden w-44 flex-col gap-y-2 bg-muted/50 p-8 xs:flex xs:border-r sm:w-52">
          <TabsSelector open={open} setOpen={setOpen} />
        </div>

        <div className="h-148 w-full p-8">
          {tabs.find((tab) => tab.id === open)?.component}
        </div>
      </DialogContent>
    </Dialog>
  )
}
