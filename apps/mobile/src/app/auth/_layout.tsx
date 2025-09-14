import React from "react"
import { Redirect, Slot } from "expo-router"

import { Loading } from "~/components/ui/loading"
import { useSession } from "~/lib/auth/auth-client"

const AuthLayout = () => {
  const session = useSession()

  if (session.isPending) {
    return <Loading />
  }

  if (session.data) {
    return <Redirect href="/" />
  }

  return <Slot />
}

export default AuthLayout
