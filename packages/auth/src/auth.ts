import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { bearer } from "better-auth/plugins"

import { db } from "@ignita/database"
import { workspaces } from "@ignita/database/schema"
import { EmailVerification, ResetPassword } from "@ignita/emails"
import { resend } from "@ignita/emails/resend"

const adapter = drizzleAdapter(db, {
  provider: "pg",
  usePlural: true,
})

export const auth = betterAuth({
  plugins: [bearer(), nextCookies()],
  database: adapter,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "auth@ignita.app",
        to: user.email,
        subject: "Reset your password",
        react: ResetPassword({ resetUrl: url, name: user.name }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "auth@ignita.app",
        to: user.email,
        subject: "Verify your email",
        react: EmailVerification({ verificationUrl: url, name: user.name }),
      })
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientId: process.env.AUTH_GOOGLE_ID!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
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
