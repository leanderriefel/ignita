import { db } from "@/server/db"
import { accounts, sessions, users } from "@/server/db/schema"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [Google],
})
