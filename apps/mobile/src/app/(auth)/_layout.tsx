import React from "react"
import { Redirect, Slot } from "expo-router"

import { useAuth } from "../../providers/auth"

const AuthLayout = () => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }
  return <Slot />
}

export default AuthLayout

