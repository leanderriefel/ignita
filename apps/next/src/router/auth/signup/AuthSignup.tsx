"use client"

import { useSearchParams } from "react-router"

import { AuthScreen, ThemeSelector } from "@nuotes/components"

import { authClient } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleSignIn = async ({
    email,
    password,
    name,
  }: {
    email: string
    password: string
    name: string
  }) => {
    await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: redirect ?? "/notes",
    })
  }

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthScreen
        onSignIn={handleSignIn}
        includeName={true}
        alreadyAccount="/auth"
      />
    </div>
  )
}

export default AuthPage
