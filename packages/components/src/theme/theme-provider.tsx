"use client"

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"

// Available themes that users can select
export const AVAILABLE_THEMES: Theme[] = [
  {
    name: "Ignita Light",
    id: "light",
    variant: "light",
  },
  {
    name: "Ignita Dark",
    id: "dark",
    variant: "dark",
  },
  {
    name: "Midnight",
    id: "midnight",
    variant: "dark",
  },
  {
    name: "Candy",
    id: "candy",
    variant: "light",
  },
  {
    name: "Nebula",
    id: "nebula",
    variant: "dark",
  },
]

export type Theme = {
  name: string
  id: string
  variant: "light" | "dark"
}
type ThemeMeta = Theme
export type ThemeId = ThemeMeta["id"]
export type ThemeVariant = ThemeMeta["variant"]

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeId | "system"
  storageKey?: string
  forcedTheme?: ThemeId
  attribute?: string | string[]
  enableSystem?: boolean
  enableColorScheme?: boolean
  value?: Record<string, string>
  themes?: string[]
  nonce?: string
  scriptProps?: React.ScriptHTMLAttributes<HTMLScriptElement>
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: ThemeId) => void
}

const initialState: ThemeProviderState = {
  theme: {
    name: "loading",
    id: "loading",
    variant: "light",
  },
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const script = (
  storageKey: string,
  defaultTheme: ThemeId | "system",
  forcedTheme: ThemeId | undefined,
  themeIds: string[],
  idToVariant: Record<string, ThemeVariant>,
  enableSystem: boolean,
) => {
  const el = document.documentElement

  function applyTheme(themeId: string) {
    const variant = idToVariant[themeId] ?? "light"
    el.style.colorScheme = variant
    el.setAttribute("data-theme-variant", variant)
    el.setAttribute("data-theme", themeId)
  }

  function getSystemVariant() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  if (forcedTheme) {
    applyTheme(forcedTheme)
    return
  }

  try {
    const stored = localStorage.getItem(storageKey)
    const preferred = stored ?? defaultTheme
    const isSystem =
      enableSystem && (preferred === "system" || !themeIds.includes(preferred))
    const themeId = isSystem
      ? getSystemVariant() === "dark"
        ? "dark"
        : "light"
      : (preferred as string)

    if (!stored) {
      try {
        localStorage.setItem(storageKey, themeId)
      } catch {}
    }

    applyTheme(themeId)
  } catch {}
}

const ThemeScript = memo(
  ({
    forcedTheme,
    storageKey,
    enableSystem = true,
    enableColorScheme = true,
    defaultTheme = "system",
    nonce,
    scriptProps,
  }: Pick<
    ThemeProviderProps,
    | "forcedTheme"
    | "storageKey"
    | "enableSystem"
    | "enableColorScheme"
    | "nonce"
    | "scriptProps"
  > & {
    defaultTheme: ThemeId | "system"
  }) => {
    const themeIds = AVAILABLE_THEMES.map((t) => t.id)
    const idToVariant = Object.fromEntries(
      AVAILABLE_THEMES.map((t) => [t.id, t.variant] as const),
    ) as Record<string, ThemeVariant>

    const scriptArgs = JSON.stringify([
      storageKey,
      defaultTheme,
      forcedTheme,
      themeIds,
      idToVariant,
      enableSystem,
      enableColorScheme,
    ]).slice(1, -1)

    return (
      <script
        {...scriptProps}
        suppressHydrationWarning
        nonce={typeof window === "undefined" ? nonce : ""}
        dangerouslySetInnerHTML={{
          __html: `(${script.toString()})(${scriptArgs})`,
        }}
      />
    )
  },
)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  forcedTheme,
  enableSystem = true,
  enableColorScheme = true,
  nonce,
  scriptProps,
  ...props
}: ThemeProviderProps) {
  const themeIds = AVAILABLE_THEMES.map((t) => t.id)
  const getVariant = (id: ThemeId): ThemeVariant =>
    AVAILABLE_THEMES.find((t) => t.id === id)?.variant ?? "light"

  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "light"

    const stored = localStorage.getItem(storageKey) as ThemeId | null
    if (stored && themeIds.includes(stored)) {
      return stored
    }

    const systemVariant = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light"
    const fallback = (systemVariant === "dark" ? "dark" : "light") as ThemeId
    try {
      localStorage.setItem(storageKey, fallback)
    } catch {}
    return fallback
  })

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement

    // Disable transitions temporarily
    root.classList.add("disable-transitions")

    root.classList.remove("light", "dark")

    const activeId = forcedTheme ?? theme
    const variant = getVariant(activeId)
    root.classList.add(variant)
    root.style.colorScheme = variant
    root.setAttribute("data-theme", activeId)

    // Re-enable transitions after theme change completes
    const timeoutId = setTimeout(() => {
      root.classList.remove("disable-transitions")
    }, 1)

    return () => clearTimeout(timeoutId)
  }, [theme, enableSystem, forcedTheme])

  const contextValue = {
    theme:
      AVAILABLE_THEMES.find((t) => t.id === (forcedTheme ?? theme)) ??
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      AVAILABLE_THEMES.find((t) => t.id === "light")!,
    setTheme: (nextTheme: ThemeId) => {
      if (forcedTheme) return
      // Validate theme is one of the supported themes
      if (!themeIds.includes(nextTheme)) {
        nextTheme = "light"
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, nextTheme)
      }
      setTheme(nextTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={contextValue}>
      <ThemeScript
        {...{
          forcedTheme,
          storageKey,
          enableSystem,
          enableColorScheme,
          defaultTheme,
          nonce,
          scriptProps,
        }}
      />
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
