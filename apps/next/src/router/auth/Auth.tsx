import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate, useSearchParams } from "react-router"

import { AuthScreen, ThemeSelector } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  if (!session.isLoading && session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: redirect ?? "/notes",
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }

    if (data) {
      queryClient.clear()
      navigate(redirect ?? "/notes")
    }
  }

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthScreen
        onSignIn={handleSignIn}
        includeName={false}
        signUp="/auth/signup"
        error={error}
      />
    </div>
  )
}

export default AuthPage
