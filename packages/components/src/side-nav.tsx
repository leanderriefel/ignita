"use client"

import { useEffect, useState } from "react"

import { SidebarNotesSelection } from "./notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"

export const SIDEBAR_WIDTH_STORAGE = "sidebarWidth"
export const SIDEBAR_TOGGLED_STORAGE = "sidebarToggled"

const getStorageValue = (key: string): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const setStorageValue = (key: string, value: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Silent fail
  }
}

interface SidebarStorageOptions {
  defaultWidth?: string
  defaultToggled?: boolean
}

interface SidebarStorage {
  width: string | undefined
  toggled: boolean | undefined
  isLoading: boolean
  updateWidth: (width: string) => void
  updateToggled: (toggled: boolean) => void
}

const useSidebarStorage = ({
  defaultWidth = "280px",
  defaultToggled = true,
}: SidebarStorageOptions = {}): SidebarStorage => {
  const [width, setWidth] = useState<string | undefined>(undefined)
  const [toggled, setToggled] = useState<boolean | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedWidth = getStorageValue(SIDEBAR_WIDTH_STORAGE)
    const storedToggled = getStorageValue(SIDEBAR_TOGGLED_STORAGE)

    setWidth(storedWidth ?? defaultWidth)
    setToggled(storedToggled ? storedToggled === "true" : defaultToggled)
    setIsLoading(false)
  }, [defaultWidth, defaultToggled])

  const updateWidth = (newWidth: string) => {
    setWidth(newWidth)
    setStorageValue(SIDEBAR_WIDTH_STORAGE, newWidth)
  }

  const updateToggled = (newToggled: boolean) => {
    setToggled(newToggled)
    setStorageValue(SIDEBAR_TOGGLED_STORAGE, newToggled.toString())
  }

  return {
    width,
    toggled,
    isLoading,
    updateWidth,
    updateToggled,
  }
}

interface SideNavProps {
  children: React.ReactNode
  initialWidth?: string
  initialToggled?: boolean
}

export const WithSideNav = ({
  children,
  initialWidth = "280px",
  initialToggled = true,
}: SideNavProps) => {
  const { width, toggled, isLoading } = useSidebarStorage({
    defaultWidth: initialWidth,
    defaultToggled: initialToggled,
  })

  if (isLoading) {
    return (
      <div className="bg-border/50 flex h-dvh w-dvw overflow-hidden">
        <div
          className="flex flex-col gap-y-2 py-9 border-r"
          style={{ width: initialWidth }}
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
      widthCookieName={SIDEBAR_WIDTH_STORAGE}
      toggledCookieName={SIDEBAR_TOGGLED_STORAGE}
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
