"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { createAuthClient } from "better-auth/react"

const AuthContext = createContext<ReturnType<typeof createAuthClient> | null>(
  null,
)

interface AuthProviderProps {
  children: ReactNode
  client: ReturnType<typeof createAuthClient>
}

export const AuthProvider = ({ children, client }: AuthProviderProps) => {
  return <AuthContext.Provider value={client}>{children}</AuthContext.Provider>
}

export const useAuthClient = () => {
  const client = useContext(AuthContext)
  if (!client) {
    throw new Error("useAuthClient must be used within an AuthProvider")
  }
  return client
}
