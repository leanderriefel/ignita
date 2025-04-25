import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import posthog from "posthog-js"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  const error = new Error("DATABASE_URL is not defined")
  posthog.captureException(error)
  throw error
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

export const db = drizzle({ client: pool, schema })
