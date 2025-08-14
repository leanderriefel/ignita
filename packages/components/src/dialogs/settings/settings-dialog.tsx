"use client"

import { useRef } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
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
import { AccountsTab } from "./tabs/account"
import { AiTab } from "./tabs/ai"

const tabs = [
  {
    label: "Account",
    id: "account",
  },
  {
    label: "AI",
    id: "ai",
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

export const SettingsDialog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const open = !!searchParams.get("settings")
    ? tabs.some((tab) => tab.id === searchParams.get("settings"))
      ? (searchParams.get("settings") as TabId)
      : defaultTab.id
    : null

  const setOpen = (open: TabId | null) => {
    if (open) {
      searchParams.set("settings", open)
    } else {
      searchParams.delete("settings")
    }
    setSearchParams(searchParams)
  }

  const tabContentRef = useRef<HTMLDivElement>(null)

  const SlidingTab = ({ children }: { children: React.ReactNode }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -8,
          transition: { type: "tween", ease: "linear", duration: 0.12 },
        }}
        transition={{
          type: "tween",
          ease: "linear",
          duration: 0.16,
          opacity: { duration: 0.12, ease: "linear" },
        }}
        style={{ willChange: "transform, opacity" }}
        className="size-full"
      >
        {children}
      </motion.div>
    )
  }

  const TabComponent = () => {
    if (!open) return null

    switch (open) {
      case "account":
        return <AccountsTab />
      case "ai":
        return <AiTab />
      default:
        return null
    }
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
        className="grid h-150 max-h-3/4 w-full max-w-5xl grid-cols-[calc(var(--spacing)*40)_1fr_calc(var(--spacing)*40)] gap-8 focus:outline-none"
        raw
        noClose
      >
        <VisuallyHidden.VisuallyHidden>
          <DialogTitle>
            {tabs.find((tab) => tab.id === open)?.label ?? defaultTab.label}
          </DialogTitle>
        </VisuallyHidden.VisuallyHidden>
        <LayoutGroup id="settings-tab-picker">
          <div className="flex h-fit flex-col overflow-hidden rounded-xl bg-card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "relative w-full cursor-pointer rounded-lg p-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  {
                    "text-primary-foreground": open === tab.id,
                    "text-foreground": open !== tab.id,
                  },
                )}
                onClick={() => {
                  setOpen(tab.id)
                }}
              >
                {open === tab.id && (
                  <>
                    <motion.div
                      layoutId="tabPickerActive"
                      className="absolute inset-0 z-0 rounded-lg bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 750,
                        damping: 28,
                        mass: 0.9,
                        bounce: 0.25,
                      }}
                    />
                    <motion.div
                      layoutId="tabPickerIndicator"
                      className="absolute top-0 bottom-0 left-0 z-0 w-0.5 rounded-lg bg-primary-foreground/80"
                      transition={{
                        type: "spring",
                        stiffness: 750,
                        damping: 28,
                        mass: 0.9,
                        bounce: 0.25,
                      }}
                    />
                  </>
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <div
          ref={tabContentRef}
          tabIndex={0}
          className={cn(
            "relative z-50 size-full rounded-lg bg-card p-8 outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 before:blur-md",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open && (
              <SlidingTab key={open}>
                <TabComponent />
              </SlidingTab>
            )}
          </AnimatePresence>
        </div>
        <DialogClose asChild className="flex flex-col gap-y-2">
          <Button
            size="square"
            variant="outline"
            className="rounded-lg disabled:pointer-events-none"
          >
            <Cross2Icon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
