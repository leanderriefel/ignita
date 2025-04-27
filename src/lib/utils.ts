import { cx } from "class-variance-authority"
import { ClassValue } from "class-variance-authority/types"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs))

export const extractSlugs = (args?: string[]) => ({
  workspace: args?.at(0),
  page: args?.at(1),
  note: args?.at(2),
})
