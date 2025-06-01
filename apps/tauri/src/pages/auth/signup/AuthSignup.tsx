"use client"

import { Navigate, useNavigate } from "react-router"

import { AuthScreen, Loading, ThemeSelector } from "@ignita/components"

import { authClient, useSession } from "~/lib/auth/auth-client"

const AuthPage = () => {
  const session = useSession()
  const navigate = useNavigate()

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

  const handleSignIn = async ({
    email,
    password,
    name,
  }: {
    email: string
    password: string
    name: string
  }) => {
    const { data } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (data?.token) {
      localStorage.setItem("bearer_token", data.token)
      await session.refetch()
      navigate("/notes")
    }
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
