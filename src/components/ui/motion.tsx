import { animate, useReducedMotion } from "motion/react";
import * as React from "react";

/**
 * Ignita motion primitives.
 *
 * Rules: 150-300ms, ease-out [0.22, 1, 0.36, 1], no bounce, reduced-motion respected.
 *
 * Hydration safety: nothing here hides server-rendered content. Entrances and count-ups only
 * run for elements that mount AFTER the app hydrated (data that arrives client-side, client
 * navigations). Elements present in the SSR HTML render at their final state.
 */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

let hydrated = false;

/** True once the root layout has committed on the client. */
export function isHydrated(): boolean {
  return hydrated;
}

/** Mount once in the root layout. Effects run child-first, so the hydration commit is excluded. */
export function HydrationMarker() {
  React.useEffect(() => {
    hydrated = true;
  }, []);
  return null;
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/* ------------------------------------------------------------------ list entrances */

const STAGGER_MS = 40;
const STAGGER_WINDOW_MS = 140;
const STAGGER_CAP = 10;

let batchStart = 0;
let batchCount = 0;

/** Rows that mount in the same burst share one batch and step 40ms apart. */
function nextStaggerDelay(): number {
  const now = performance.now();
  if (now - batchStart > STAGGER_WINDOW_MS) {
    batchStart = now;
    batchCount = 0;
  }
  const delay = Math.min(batchCount, STAGGER_CAP) * STAGGER_MS;
  batchCount += 1;
  return delay;
}

/** key -> first-mount record; virtualized rows that remount never replay their entrance. */
const entranceRegistry = new Map<string, { at: number; delay: number }>();

/**
 * Staggered row entrance (opacity + 10px rise, 260ms) driven by the `enter-rise` CSS class.
 * Returns a ref for the row element. Pass a stable key (match id, puuid) so a row that is
 * recycled by the virtualizer stays put instead of re-animating.
 */
export function useEnterStagger<T extends HTMLElement>(key: string) {
  const ref = React.useRef<T>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const now = performance.now();
    const seen = entranceRegistry.get(key);

    if (!hydrated) {
      // Present in SSR markup / hydration commit: never animate.
      entranceRegistry.set(key, { at: now, delay: 0 });
      el.style.animation = "none";
      return;
    }

    if (seen && now - seen.at > 80) {
      el.style.animation = "none";
      return;
    }

    const delay = seen ? seen.delay : nextStaggerDelay();
    entranceRegistry.set(key, { at: seen ? seen.at : now, delay });
    el.style.animationDelay = `${delay}ms`;
  }, [key]);

  return ref;
}

/* ------------------------------------------------------------------ count-up numerals */

/** Animates a number toward `target` (from 0 on client mount, from the last value on change). */
export function useCountUp(target: number, duration = 0.7): number {
  const reduce = useReducedMotion();
  const [value, setValue] = React.useState(() =>
    hydrated && Number.isFinite(target) ? 0 : target,
  );
  const currentRef = React.useRef(value);

  React.useEffect(() => {
    if (reduce || !Number.isFinite(target)) {
      currentRef.current = target;
      setValue(target);
      return;
    }
    const from = currentRef.current;
    if (from === target) {
      return;
    }
    const controls = animate(from, target, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        currentRef.current = latest;
        setValue(latest);
      },
      onComplete: () => {
        currentRef.current = target;
        setValue(target);
      },
    });
    return () => controls.stop();
  }, [target, duration, reduce]);

  return value;
}

interface ParsedNumeric {
  prefix: string;
  value: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

const NUMERIC_RE = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/;

export function parseNumericText(text: string): ParsedNumeric | null {
  const match = NUMERIC_RE.exec(text);
  if (!match) {
    return null;
  }
  const [, prefix = "", raw = "", suffix = ""] = match;
  const value = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(value)) {
    return null;
  }
  const dot = raw.indexOf(".");
  return {
    prefix,
    value,
    decimals: dot === -1 ? 0 : raw.length - dot - 1,
    grouped: raw.includes(","),
    suffix,
  };
}

function formatParsed(parsed: ParsedNumeric, value: number): string {
  const body = parsed.grouped
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
      })
    : value.toFixed(parsed.decimals);
  return `${parsed.prefix}${body}${parsed.suffix}`;
}

/** Count-up for a display string such as "4.38", "55.5%", "+19 LP", "1,204". */
export function useAnimatedNumericText(text: string, duration = 0.7): string {
  const parsed = React.useMemo(() => parseNumericText(text), [text]);
  const value = useCountUp(parsed ? parsed.value : 0, duration);
  if (!parsed) {
    return text;
  }
  return formatParsed(parsed, value);
}

/** Inline count-up text; tabular figures keep digits from jittering. */
export function AnimatedText({
  value,
  duration,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const text = useAnimatedNumericText(value, duration);
  return <span className={className}>{text}</span>;
}

/* ------------------------------------------------------------------ below-fold reveals */

/**
 * Reveals its content (opacity + 12px rise, 320ms) the first time it scrolls into view.
 * Content that is already on screen when it mounts is left untouched, so SSR'd sections
 * never flash and nothing above the fold waits on JavaScript.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") {
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      return;
    }
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    let controls: { stop: () => void } | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        observer.disconnect();
        controls = animate(
          el,
          { opacity: 1, transform: "translateY(0px)" },
          { duration: 0.32, delay, ease: EASE_OUT },
        );
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      controls?.stop();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [reduce, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
