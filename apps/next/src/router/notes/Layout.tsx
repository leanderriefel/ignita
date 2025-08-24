import { useEffect } from "react"
import { redirect } from "next/navigation"
import { Outlet, useLocation } from "react-router"

import { Loading, TopNav, WithWindows } from "@ignita/components"

import { useSession } from "~/lib/auth/auth-client"

const NotesLayout = () => {
  const session = useSession()
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem("pick-up-where-left-off", location.pathname)
  }, [location.pathname])

  if (session.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    redirect(`/auth?redirect=${encodeURIComponent(location.pathname)}`)
  }

  return (
    <WithWindows>
      <div className="absolute top-6 right-0 left-0 z-30 mx-6">
        <TopNav />
      </div>
      <div className="size-full">
        <Outlet />
      </div>
    </WithWindows>
  )
}

export default NotesLayout
