"use client"

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  forcedTheme?: Theme
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
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const script = (
  attribute: string | string[],
  storageKey: string,
  defaultTheme: Theme,
  forcedTheme: Theme | undefined,
  themes: string[],
  themeValue: Record<string, string> | undefined,
  enableSystem: boolean,
  enableColorScheme: boolean,
) => {
  const el = document.documentElement
  const systemThemes = ["light", "dark"]

  function updateDOM(theme: string) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute]

    attributes.forEach((attr) => {
      const isClass = attr === "class"
      const classes =
        isClass && themeValue ? themes.map((t) => themeValue[t] ?? t) : themes
      if (isClass) {
        el.classList.remove(...classes)
        el.classList.add(themeValue?.[theme] ?? theme)
      } else {
        el.setAttribute(attr, theme)
      }
    })

    setColorScheme(theme)
  }

  function setColorScheme(theme: string) {
    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme
    }
  }

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  if (forcedTheme) {
    updateDOM(forcedTheme)
  } else {
    try {
      const themeName = localStorage.getItem(storageKey) ?? defaultTheme
      const isSystem = enableSystem && themeName === "system"
      const theme = isSystem ? getSystemTheme() : themeName
      updateDOM(theme)
    } catch {}
  }
}

const ThemeScript = memo(
  ({
    forcedTheme,
    storageKey,
    attribute = "class",
    enableSystem = true,
    enableColorScheme = true,
    defaultTheme = "system",
    value,
    themes = ["light", "dark"],
    nonce,
    scriptProps,
  }: Omit<ThemeProviderProps, "children"> & { defaultTheme: Theme }) => {
    const scriptArgs = JSON.stringify([
      attribute,
      storageKey,
      defaultTheme,
      forcedTheme,
      themes,
      value,
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
  attribute = "class",
  enableSystem = true,
  enableColorScheme = true,
  value: themeValue,
  themes = ["light", "dark"],
  nonce,
  scriptProps,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const stored = localStorage.getItem(storageKey) as Theme | null
    return stored ?? defaultTheme
  })
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(theme)

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement

    // Disable transitions temporarily
    root.classList.add("disable-transitions")

    root.classList.remove("light", "dark")

    if (forcedTheme) {
      root.classList.add(forcedTheme)
      root.style.colorScheme = forcedTheme
      setResolvedTheme(forcedTheme)
    } else if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      root.style.colorScheme = systemTheme
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      root.style.colorScheme = theme
      setResolvedTheme(theme)
    }

    // Re-enable transitions after theme change completes
    const timeoutId = setTimeout(() => {
      root.classList.remove("disable-transitions")
    }, 1)

    return () => clearTimeout(timeoutId)
  }, [theme, enableSystem, forcedTheme])

  const contextValue = {
    theme,
    resolvedTheme,
    setTheme: (nextTheme: Theme) => {
      if (forcedTheme) return
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
          attribute,
          enableSystem,
          enableColorScheme,
          defaultTheme,
          value: themeValue,
          themes,
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
