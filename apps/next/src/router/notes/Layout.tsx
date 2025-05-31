import { useSession } from "@/lib/auth/auth-client"
import { Loading } from "@nuotes/components"
import { Navigate, Outlet } from "react-router"

const NotesLayout = () => {
  const session = useSession()

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

export default NotesLayout
