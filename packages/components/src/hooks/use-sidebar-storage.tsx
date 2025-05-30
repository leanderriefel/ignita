"use client"

import { useEffect, useState } from "react"

export const SIDEBAR_WIDTH_COOKIE = "sidebarWidth"
export const SIDEBAR_TOGGLED_COOKIE = "sidebarToggled"

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

const isTauri = () => typeof window !== "undefined" && "__TAURI__" in window

const getStorageValue = (key: string): string | null => {
  if (typeof window === "undefined") return null

  try {
    // Try localStorage first
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const setStorageValue = (key: string, value: string) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, value)

    // Also set as cookie for SSR compatibility when not in Tauri
    if (!isTauri()) {
      document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`
    }
  } catch {
    // Silent fail
  }
}

export const useSidebarStorage = ({
  defaultWidth = "280px",
  defaultToggled = false,
}: SidebarStorageOptions = {}): SidebarStorage => {
  const [width, setWidth] = useState<string | undefined>(undefined)
  const [toggled, setToggled] = useState<boolean | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hydrate from storage
    const storedWidth = getStorageValue(SIDEBAR_WIDTH_COOKIE)
    const storedToggled = getStorageValue(SIDEBAR_TOGGLED_COOKIE)

    setWidth(storedWidth ?? defaultWidth)
    setToggled(storedToggled ? storedToggled === "true" : defaultToggled)
    setIsLoading(false)
  }, [defaultWidth, defaultToggled])

  const updateWidth = (newWidth: string) => {
    setWidth(newWidth)
    setStorageValue(SIDEBAR_WIDTH_COOKIE, newWidth)
  }

  const updateToggled = (newToggled: boolean) => {
    setToggled(newToggled)
    setStorageValue(SIDEBAR_TOGGLED_COOKIE, newToggled.toString())
  }

  return {
    width,
    toggled,
    isLoading,
    updateWidth,
    updateToggled,
  }
}
