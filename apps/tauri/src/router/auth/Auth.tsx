import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate } from "react-router"

import { ThemeSelector } from "@ignita/components"
import { SignIn } from "@ignita/components/auth"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  if (!session.isPending && session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleSocialSignIn = async (provider: "google") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
      disableRedirect: true,
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }
  }

  const handleEmailAndPasswordSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message ?? signInError.statusText)
    }

    if (data?.token) {
      queryClient.clear()
      navigate("/notes")
    }
  }

  return (
    <div className="relative flex size-full items-center justify-center p-4">
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
