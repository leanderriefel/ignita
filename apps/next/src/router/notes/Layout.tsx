import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router"

import { Loading } from "@ignita/components"

import { useSession } from "~/lib/auth/auth-client"

const NotesLayout = () => {
  const session = useSession()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith("/notes")) {
      localStorage.setItem("pick-up-where-left-off", location.pathname)
    }
  }, [location.pathname])

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    // eslint-disable-next-line no-console
    console.log(
      "No session data, redirecting to auth",
      JSON.stringify(session, null, 2),
    )
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}

export default NotesLayout
