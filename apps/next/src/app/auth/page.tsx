"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { SignIn } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
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

  const handleSocialSignIn = async (provider: "google") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: redirect ?? "/notes",
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
      router.replace(redirect ?? "/notes")
    }
  }

  return (
    <div className="flex h-dvh w-dvw items-center justify-center p-4">
      <SignIn
        socialProviders={["google"]}
        onSocialSignIn={handleSocialSignIn}
        onEmailAndPasswordSignIn={handleEmailAndPasswordSignIn}
        onGoToSignUp={() => router.push("/auth/signup")}
        error={error}
      />
    </div>
  )
}

export default AuthPage
