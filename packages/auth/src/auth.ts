import { tauri } from "@daveyplate/better-auth-tauri/plugin"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db } from "@nuotes/database"

// import { nextCookies } from "better-auth/next-js"

const adapter = drizzleAdapter(db, {
  provider: "pg",
  usePlural: true,
})

export const auth = betterAuth({
  plugins: [
    tauri({
      scheme: "nuotes",
      debugLogs: process.env.NODE_ENV === "development",
      successURL: "/auth/success",
    }),
    // nextCookies(),
  ],
  database: adapter,
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    },
  },
  trustedOrigins: [
    "nuotes://",
    "nuotes://*",
    "http://tauri.localhost", // Production Tauri app
    "http://localhost:1420", // Tauri app
    "http://localhost:3000", // Next.js app
    "https://nuotes.vercel.app", // Production
  ],
})
