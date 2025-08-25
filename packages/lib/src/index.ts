import { cx } from "class-variance-authority"
import { type ClassValue } from "class-variance-authority/types"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs))

export * from "./jsonb"
export * from "./use-debounced"
export * from "./notes"
