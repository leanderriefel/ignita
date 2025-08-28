"use client"

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"

// Text fonts for regular text content
export const TEXT_FONTS: NormalFont[] = [
  {
    name: "Geist",
    id: "geist",
    family: "Geist, system-ui, sans-serif",
  },
  {
    name: "Inter",
    id: "inter",
    family: "Inter, system-ui, sans-serif",
  },
  {
    name: "Roboto",
    id: "roboto",
    family: "Roboto, system-ui, sans-serif",
  },
  {
    name: "Open Sans",
    id: "open-sans",
    family: "Open Sans, system-ui, sans-serif",
  },
  {
    name: "Lato",
    id: "lato",
    family: "Lato, system-ui, sans-serif",
  },
]

// Monospace fonts for code and technical content
export const MONOSPACE_FONTS: MonospaceFont[] = [
  {
    name: "Geist Mono",
    id: "geist-mono",
    family: "Geist Mono, system-ui, monospace",
  },
  {
    name: "JetBrains Mono",
    id: "jetbrains-mono",
    family: "JetBrains Mono, 'Fira Code', 'Cascadia Code', monospace",
  },
  {
    name: "Fira Code",
    id: "fira-code",
    family: "Fira Code, 'JetBrains Mono', 'Cascadia Code', monospace",
  },
  {
    name: "Cascadia Code",
    id: "cascadia-code",
    family: "Cascadia Code, 'JetBrains Mono', 'Fira Code', monospace",
  },
  {
    name: "Source Code Pro",
    id: "source-code-pro",
    family: "Source Code Pro, 'JetBrains Mono', monospace",
  },
]

export type NormalFont = {
  name: string
  id: string
  family: string
}

export type MonospaceFont = {
  name: string
  id: string
  family: string
}

// Combined font type for backwards compatibility
export type Font = (NormalFont | MonospaceFont) & {
  type: "normal" | "monospace"
}

export type NormalFontId = NormalFont["id"]
export type MonospaceFontId = MonospaceFont["id"]
export type FontId = NormalFontId | MonospaceFontId
export type FontType = "normal" | "monospace"

type FontProviderProps = {
  children: React.ReactNode
  defaultNormalFont?: NormalFontId
  defaultMonospaceFont?: MonospaceFontId
  normalStorageKey?: string
  monospaceStorageKey?: string
  forcedNormalFont?: NormalFontId
  forcedMonospaceFont?: MonospaceFontId
  nonce?: string
  scriptProps?: React.ScriptHTMLAttributes<HTMLScriptElement>
}

type FontProviderState = {
  normalFont: NormalFont
  monospaceFont: MonospaceFont
  setNormalFont: (font: NormalFontId) => void
  setMonospaceFont: (font: MonospaceFontId) => void
}

const initialState: FontProviderState = {
  normalFont: {
    name: "loading",
    id: "loading",
    family: "system-ui, sans-serif",
  },
  monospaceFont: {
    name: "loading",
    id: "loading",
    family: "monospace",
  },
  setNormalFont: () => null,
  setMonospaceFont: () => null,
}

const FontProviderContext = createContext<FontProviderState>(initialState)

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const script = (
  normalStorageKey: string,
  monospaceStorageKey: string,
  defaultNormalFont: NormalFontId,
  defaultMonospaceFont: MonospaceFontId,
  forcedNormalFont: NormalFontId | undefined,
  forcedMonospaceFont: MonospaceFontId | undefined,
  normalFontIds: string[],
  monospaceFontIds: string[],
  idToFamily: Record<string, string>,
) => {
  const el = document.documentElement

  function applyFont(fontType: FontType, fontId: string) {
    const family =
      idToFamily[fontId] ??
      (fontType === "monospace" ? "monospace" : "system-ui, sans-serif")
    el.style.setProperty(`--font-${fontType}`, family)
    const cssVarName = fontType === "normal" ? "font-text" : "font-monospace"
    el.style.setProperty(`--${cssVarName}`, family)
  }

  if (forcedNormalFont) {
    applyFont("normal", forcedNormalFont)
  }
  if (forcedMonospaceFont) {
    applyFont("monospace", forcedMonospaceFont)
  }
  if (forcedNormalFont && forcedMonospaceFont) {
    return
  }

  try {
    const storedNormal = localStorage.getItem(normalStorageKey)
    const storedMonospace = localStorage.getItem(monospaceStorageKey)

    const normalId = forcedNormalFont ?? storedNormal ?? defaultNormalFont
    const monospaceId =
      forcedMonospaceFont ?? storedMonospace ?? defaultMonospaceFont

    // Validate font IDs
    const validNormalId = normalFontIds.includes(normalId)
      ? normalId
      : defaultNormalFont
    const validMonospaceId = monospaceFontIds.includes(monospaceId)
      ? monospaceId
      : defaultMonospaceFont

    if (!storedNormal) {
      try {
        localStorage.setItem(normalStorageKey, validNormalId)
      } catch {}
    }

    if (!storedMonospace) {
      try {
        localStorage.setItem(monospaceStorageKey, validMonospaceId)
      } catch {}
    }

    if (!forcedNormalFont) applyFont("normal", validNormalId)
    if (!forcedMonospaceFont) applyFont("monospace", validMonospaceId)
  } catch {}
}

const FontScript = memo(
  ({
    forcedNormalFont,
    forcedMonospaceFont,
    normalStorageKey,
    monospaceStorageKey,
    defaultNormalFont = "geist",
    defaultMonospaceFont = "geist-mono",
    nonce,
    scriptProps,
  }: Pick<
    FontProviderProps,
    | "forcedNormalFont"
    | "forcedMonospaceFont"
    | "normalStorageKey"
    | "monospaceStorageKey"
    | "nonce"
    | "scriptProps"
  > & {
    defaultNormalFont: NormalFontId
    defaultMonospaceFont: MonospaceFontId
  }) => {
    const normalFontIds = TEXT_FONTS.map((f) => f.id)
    const monospaceFontIds = MONOSPACE_FONTS.map((f) => f.id)
    const idToFamily = Object.fromEntries([
      ...TEXT_FONTS.map((f) => [f.id, f.family] as const),
      ...MONOSPACE_FONTS.map((f) => [f.id, f.family] as const),
    ]) as Record<string, string>

    const scriptArgs = JSON.stringify([
      normalStorageKey,
      monospaceStorageKey,
      defaultNormalFont,
      defaultMonospaceFont,
      forcedNormalFont,
      forcedMonospaceFont,
      normalFontIds,
      monospaceFontIds,
      idToFamily,
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

export function FontProvider({
  children,
  defaultNormalFont = "geist",
  defaultMonospaceFont = "geist-mono",
  normalStorageKey = "font-text",
  monospaceStorageKey = "font-monospace",
  forcedNormalFont,
  forcedMonospaceFont,
  nonce,
  scriptProps,
  ...props
}: FontProviderProps) {
  const normalFontIds = TEXT_FONTS.map((f) => f.id)
  const monospaceFontIds = MONOSPACE_FONTS.map((f) => f.id)

  const getNormalFont = (id: NormalFontId): NormalFont =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TEXT_FONTS.find((f) => f.id === id) ?? TEXT_FONTS[0]!

  const getMonospaceFont = (id: MonospaceFontId): MonospaceFont =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    MONOSPACE_FONTS.find((f) => f.id === id) ?? MONOSPACE_FONTS[0]!

  const [normalFont, setNormalFontState] = useState<NormalFontId>(() => {
    if (typeof window === "undefined") return defaultNormalFont

    try {
      const stored = localStorage.getItem(normalStorageKey)
      if (stored && normalFontIds.includes(stored)) {
        return stored as NormalFontId
      }
    } catch {}

    return defaultNormalFont
  })

  const [monospaceFont, setMonospaceFontState] = useState<MonospaceFontId>(
    () => {
      if (typeof window === "undefined") return defaultMonospaceFont

      try {
        const stored = localStorage.getItem(monospaceStorageKey)
        if (stored && monospaceFontIds.includes(stored)) {
          return stored as MonospaceFontId
        }
      } catch {}

      return defaultMonospaceFont
    },
  )

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement

    const activeNormalId = forcedNormalFont ?? normalFont
    const activeMonospaceId = forcedMonospaceFont ?? monospaceFont

    const normalFontObj = getNormalFont(activeNormalId)
    const monospaceFontObj = getMonospaceFont(activeMonospaceId)

    root.style.setProperty("--font-normal", normalFontObj.family)
    root.style.setProperty("--font-monospace", monospaceFontObj.family)
    root.style.setProperty("--font-text", normalFontObj.family)
  }, [normalFont, monospaceFont, forcedNormalFont, forcedMonospaceFont])

  const contextValue = {
    normalFont: forcedNormalFont
      ? getNormalFont(forcedNormalFont)
      : getNormalFont(normalFont),
    monospaceFont: forcedMonospaceFont
      ? getMonospaceFont(forcedMonospaceFont)
      : getMonospaceFont(monospaceFont),
    setNormalFont: (nextFont: NormalFontId) => {
      if (forcedNormalFont) return
      // Validate font is one of the supported fonts
      if (!normalFontIds.includes(nextFont)) {
        nextFont = "geist"
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(normalStorageKey, nextFont)
        } catch {}
      }
      setNormalFontState(nextFont)
    },
    setMonospaceFont: (nextFont: MonospaceFontId) => {
      if (forcedMonospaceFont) return
      // Validate font is one of the supported fonts
      if (!monospaceFontIds.includes(nextFont)) {
        nextFont = "geist-mono"
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(monospaceStorageKey, nextFont)
        } catch {}
      }
      setMonospaceFontState(nextFont)
    },
  }

  return (
    <FontProviderContext.Provider {...props} value={contextValue}>
      <FontScript
        {...{
          forcedNormalFont,
          forcedMonospaceFont,
          normalStorageKey,
          monospaceStorageKey,
          defaultNormalFont,
          defaultMonospaceFont,
          nonce,
          scriptProps,
        }}
      />
      {children}
    </FontProviderContext.Provider>
  )
}

export const useFont = () => {
  const context = useContext(FontProviderContext)

  if (context === undefined)
    throw new Error("useFont must be used within a FontProvider")

  return context
}
