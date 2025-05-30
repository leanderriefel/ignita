import { useSession } from "@/lib/auth/auth-client"
import { Loading } from "@nuotes/components"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"

const NotesLayout = () => {
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session.isPending && !session.data) {
      navigate("/auth", { replace: true })
    }
  }, [session.isPending, session.data, navigate])

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    return null
  }

  return <Outlet />
}

export default NotesLayout
