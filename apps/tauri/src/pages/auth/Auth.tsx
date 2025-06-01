"use client"

import { signInSocial } from "@daveyplate/better-auth-tauri"
import { Navigate } from "react-router"

import { AuthScreen, Loading, ThemeSelector } from "@nuotes/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (session.data) {
    return <Navigate to="/notes" replace />
  }

  const handleGoogleSignIn = async () => {
    await signInSocial({
      authClient,
      provider: "google",
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
