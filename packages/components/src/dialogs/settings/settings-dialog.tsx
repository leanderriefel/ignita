"use client"

import { useRef, useState } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { AnimatePresence, motion } from "motion/react"
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

const tabs = [
  {
    label: "Account",
    id: "account",
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

  const [openedBefore, setOpenedBefore] = useState<TabId | null>(null)

  const setOpen = (open: TabId | null) => {
    if (open) {
      searchParams.set("settings", open)
      // Set openedBefore when dialog first opens
      if (!openedBefore) {
        setOpenedBefore(open)
      }
    } else {
      searchParams.delete("settings")
      // Reset openedBefore when dialog closes
      setOpenedBefore(null)
    }
    setSearchParams(searchParams)
  }

  const tabContentRef = useRef<HTMLDivElement>(null)

  const SlidingTab = ({ children }: { children: React.ReactNode }) => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -4,
        }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        }}
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
        <div className="flex h-fit flex-col divide-y overflow-hidden rounded-xl bg-card p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "w-full cursor-pointer p-2 text-sm outline-none first:rounded-t-lg last:rounded-b-lg focus-visible:ring-2 focus-visible:ring-primary",
                {
                  "bg-primary text-primary-foreground": open === tab.id,
                  "bg-background text-foreground": open !== tab.id,
                },
              )}
              onClick={() => {
                setOpenedBefore(open)
                setOpen(tab.id)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          ref={tabContentRef}
          tabIndex={0}
          className={cn(
            "relative z-50 size-full rounded-lg bg-card p-8 outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 before:blur-md",
          )}
        >
          <AnimatePresence mode="wait" key={open}>
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
