import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

export const db = drizzle({ client: pool, schema })
