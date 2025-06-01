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
  }: {
    email: string
    password: string
  }) => {
    const { data } = await authClient.signIn.email({
      email,
      password,
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
        includeName={false}
        signUp="/auth/signup"
      />
    </div>
  )
}

export default AuthPage
