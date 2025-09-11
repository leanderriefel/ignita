"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { createAuthClient } from "better-auth/react"

export type AuthClient = ReturnType<typeof createAuthClient>

const AuthContext = createContext<AuthClient | null>(null)

interface AuthProviderProps {
  children: ReactNode
  client: AuthClient
}

export const AuthProvider = ({ children, client }: AuthProviderProps) => {
  return <AuthContext.Provider value={client}>{children}</AuthContext.Provider>
}

export const useAuthClient = (): AuthClient => {
  const client = useContext(AuthContext)
  if (!client) {
    throw new Error("useAuthClient must be used within an AuthProvider")
  }
  return client
}
