import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router"

import { SignIn, ThemeSelector } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const Auth = () => {
  const session = useSession()
  const [searchParams] = useSearchParams()
  const redirect = searchParams?.get("redirect")
  const navigate = useNavigate()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!session.isPending && session.data) {
      navigate(redirect ?? "/notes?noRedirect=true", { replace: true })
    }
  }, [session.isPending, session.data, navigate, redirect])

  const handleSocialSignIn = async (provider: "google") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: redirect ?? "/notes?noRedirect=true",
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
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setError(error.message ?? error.statusText)
    }

    if (data) {
      queryClient.clear()
      navigate(redirect ?? "/notes?noRedirect=true", { replace: true })
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

export default Auth
