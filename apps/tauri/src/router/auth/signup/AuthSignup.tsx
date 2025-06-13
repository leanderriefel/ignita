import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate } from "react-router"

import { ThemeSelector } from "@ignita/components"
import { SignUp } from "@ignita/components/auth"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthSignUp = () => {
  const session = useSession()
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  if (!session.isPending && session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleSocialSignUp = async (provider: "google") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
      disableRedirect: true,
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }
  }

  const handleEmailAndPasswordSignUp = async ({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
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
      <SignUp
        socialProviders={["google"]}
        onSocialSignUp={handleSocialSignUp}
        onEmailAndPasswordSignUp={handleEmailAndPasswordSignUp}
        error={error}
      />
    </div>
  )
}

export default AuthSignUp
