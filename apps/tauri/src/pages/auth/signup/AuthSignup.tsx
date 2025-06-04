import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate } from "react-router"

import { AuthScreen, ThemeSelector } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  if (!session.isPending && session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleSignUp = async ({
    email,
    password,
    name,
  }: {
    email: string
    password: string
    name: string
  }) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }

    if (data?.token) {
      localStorage.setItem("bearer_token", data.token)
      queryClient.clear()
      navigate("/notes")
    }
  }

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthScreen
        onSignIn={handleSignUp}
        includeName={true}
        alreadyAccount="/auth"
        error={error}
      />
    </div>
  )
}

export default AuthPage
