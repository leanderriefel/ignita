import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { bearer } from "better-auth/plugins"

import { db } from "@ignita/database"
import { workspaces } from "@ignita/database/schema"
import {
  DeleteAccount,
  EmailChangeConfirmation,
  EmailVerification,
  ResetPassword,
} from "@ignita/emails"
import { resend } from "@ignita/emails/resend"

import { tauri } from "./tauri"

const adapter = drizzleAdapter(db, {
  provider: "pg",
  usePlural: true,
})

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  plugins: [bearer(), nextCookies(), tauri()],
  database: adapter,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Ignita <auth@ignita.app>",
        to: user.email,
        subject: "Reset your password",
        react: ResetPassword({ resetUrl: url, name: user.name }),
        text: `Hello ${user.name ?? "there"}, we received a request to reset your password. Visit the following link to set a new password: ${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Ignita <auth@ignita.app>",
        to: user.email,
        subject: "Verify your email",
        react: EmailVerification({ verificationUrl: url, name: user.name }),
        text: `Hello ${user.name ?? "there"}, we received a request to verify your email. Visit the following link to verify your email: ${url}`,
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
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await resend.emails.send({
          from: "Ignita <auth@ignita.app>",
          to: user.email,
          subject: "Confirm your email change",
          react: EmailChangeConfirmation({
            confirmUrl: url,
            name: user.name,
            newEmail,
          }),
          text: `Hello ${user.name ?? "there"}, we received a request to change your email. Visit the following link to confirm the change: ${url}`,
        })
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await resend.emails.send({
          from: "Ignita <auth@ignita.app>",
          to: user.email,
          subject: "Delete your account",
          react: DeleteAccount({ deleteUrl: url, name: user.name }),
          text: `Hello ${user.name ?? "there"}, we received a request to delete your account. Visit the following link to confirm the deletion: ${url}`,
        })
      },
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
        after: async (user) => {
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
    "http://localhost:17636",
    "http://tauri.localhost", // Production Tauri app
    "http://localhost:1420", // Tauri app
    "http://localhost:3000", // Next.js app
    "https://www.ignita.app", // Production
    "https://ignita.app", // Production
  ],
})
