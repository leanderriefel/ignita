"use client"

import { useEffect } from "react"
import { useSearchParams } from "react-router"

import { AuthSuccess, ThemeSelector } from "@nuotes/components"

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("tauriRedirect")

  useEffect(() => {
    if (!window || !redirect) return

    window.location.href = redirect
  }, [redirect])

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSelector className="absolute top-8 left-8" />
      <AuthSuccess />
    </div>
  )
}

export default AuthPage
