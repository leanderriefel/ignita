import "server-only"
import { auth } from "@/auth"
import { db } from "@/server/db/db"
import { cache } from "react"

export const getWorkspaces = cache(async () => {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")
  const user = session.user

  console.log("Fetching workspaces for user:", user.id)

  const res = await db.query.workspaces.findMany({
    where: (workspaces, { eq }) => eq(workspaces.userId, user.id),
    with: {
      notes: {
        with: {
          pages: {
            with: {
              blocks: true,
            },
          },
        },
      },
    },
  })
  return res
})
