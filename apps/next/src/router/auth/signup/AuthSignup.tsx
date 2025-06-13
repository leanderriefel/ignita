import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { ThemeSelector } from "@ignita/components"
import { SignUp } from "@ignita/components/auth"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthSignup = () => {
  const session = useSession()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const router = useRouter()

  const [error, setError] = useState<string>()

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!session.isPending && session.data) {
      router.replace(redirect ?? "/notes")
    }
  }, [session.isPending, session.data, router, redirect])

  const handleSocialSignUp = async (provider: "google") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: redirect ?? "/notes",
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

    if (data) {
      queryClient.clear()
      router.push(redirect ?? "/notes")
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

export default AuthSignup
