import { cx } from "class-variance-authority"
import { ClassValue } from "class-variance-authority/types"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs))
