"use client"

import { useSession } from "@/lib/auth/auth-client"
import { Loading } from "@nuotes/components"
import { redirect } from "next/navigation"

const NotesLayout = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()

  if (session.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    redirect("/auth")
  }

  return children
}

export default NotesLayout
