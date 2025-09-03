import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

type AuthContextValue = {
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const signIn = useCallback(async (_email: string, _password: string) => {
    setIsAuthenticated(true)
  }, [])

  const signUp = useCallback(async (_email: string, _password: string) => {
    setIsAuthenticated(true)
  }, [])

  const signOut = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, signIn, signUp, signOut }),
    [isAuthenticated, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
