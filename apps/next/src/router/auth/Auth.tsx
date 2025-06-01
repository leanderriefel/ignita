"use client"

import { useSearchParams } from "react-router"

import { AuthScreen, ThemeSelector } from "@ignita/components"

import { authClient } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    await authClient.signIn.email({
      email,
      password,
      callbackURL: redirect ?? "/notes",
    })
  }

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthScreen
        onSignIn={handleSignIn}
        includeName={false}
        signUp="/auth/signup"
      />
    </div>
  )
}

export default AuthPage
