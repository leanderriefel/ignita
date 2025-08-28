"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { SignUp } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthSignupPage = () => {
  const session = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get("redirect") ?? null

  const [error, setError] = useState<string>()

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
      router.replace(redirect ?? "/notes")
    }
  }

  return (
    <div className="flex h-dvh w-dvw items-center justify-center p-4">
      <SignUp
        socialProviders={["google"]}
        onSocialSignUp={handleSocialSignUp}
        onEmailAndPasswordSignUp={handleEmailAndPasswordSignUp}
        onGoToSignIn={() => router.push("/auth")}
        error={error}
      />
    </div>
  )
}

export default AuthSignupPage
