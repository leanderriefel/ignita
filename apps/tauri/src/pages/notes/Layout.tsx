import { useSession } from "@/lib/auth/auth-client"
import { Loading } from "@nuotes/components"
import { useEffect } from "react"
import { Navigate, Outlet } from "react-router"

const NotesLayout = () => {
  const session = useSession()

  if (session.isLoading) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  useEffect(() => {
    console.log("session.data", session.data)
  }, [session.data])

  if (!session.data) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

export default NotesLayout
