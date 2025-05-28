import type { Config } from "tailwindcss"

import sharedConfig from "@nuotes/tailwind"

const config: Config = {
  presets: [sharedConfig],
  content: [
    // App content
    `./src/**/*.{js,ts,jsx,tsx}`,
    // Include packages UI
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
}

export default config
