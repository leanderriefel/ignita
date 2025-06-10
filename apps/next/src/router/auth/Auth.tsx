import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate, useSearchParams } from "react-router"

import { ThemeSelector } from "@ignita/components"
import { SignIn } from "@ignita/components/auth"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  if (!session.isPending && session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleSocialSignIn = async (provider: "google") => {
    const { data, error } = await authClient.signIn.social({
      provider,
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }

    if (data) {
      queryClient.clear()
      navigate(redirect ?? "/notes")
    }
  }

  const handleEmailAndPasswordSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
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
      <SignIn
        socialProviders={["google"]}
        onSocialSignIn={handleSocialSignIn}
        onEmailAndPasswordSignIn={handleEmailAndPasswordSignIn}
        error={error}
      />
    </div>
  )
}

export default AuthPage
