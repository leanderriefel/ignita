"use client"

import { signIn } from "@/lib/auth/auth-client"
import { AuthScreen, ThemeSelector } from "@nuotes/components"
import { useSearchParams } from "next/navigation"

const AuthPage = () => {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: redirect ?? "/notes",
    })
  }

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthScreen onSignIn={handleGoogleSignIn} />
    </div>
  )
}

export default AuthPage
