import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { bearer } from "better-auth/plugins"

import { db } from "@ignita/database"
import { workspaces } from "@ignita/database/schema"

const adapter = drizzleAdapter(db, {
  provider: "pg",
  usePlural: true,
})

export const auth = betterAuth({
  plugins: [bearer(), nextCookies()],
  database: adapter,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          if (ctx?.error) return

          await db.insert(workspaces).values({
            name: `${user.name}'s Workspace`,
            userId: user.id,
          })
        },
      },
    },
  },
  trustedOrigins: [
    "ignita://",
    "ignita://*",
    "http://localhost:17636",
    "http://tauri.localhost", // Production Tauri app
    "http://localhost:1420", // Tauri app
    "http://localhost:3000", // Next.js app
    "https://www.ignita.app", // Production
  ],
})
