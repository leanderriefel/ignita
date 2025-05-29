import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Load root .env file
config()

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/database/src/schema.ts",
  out: "./drizzle",
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
