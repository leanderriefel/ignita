import { auth } from "@/auth"
import { redirect } from "next/navigation"

const NotesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session?.user) throw redirect("/auth")

  return children
}

export default NotesLayout
