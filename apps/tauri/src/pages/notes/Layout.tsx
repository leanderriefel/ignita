import { useSession } from "@/lib/auth/auth-client"
import { Loading } from "@nuotes/components"
import { Outlet, useNavigate } from "react-router-dom"

const NotesLayout = () => {
  const session = useSession()
  const navigate = useNavigate()

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    navigate("/auth", { replace: true })
    return null
  }

  return <Outlet />
}

export default NotesLayout
