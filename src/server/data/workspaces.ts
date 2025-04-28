import "server-only"
import { auth } from "@/auth"
import { db } from "@/server/db"
import { workspaces } from "@/server/db/schema"
import { sql } from "drizzle-orm"
import { cache } from "react"

export const getWorkspaces = cache(async () => {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  return await db
    .select()
    .from(workspaces)
    .where(sql`${workspaces.userId} = ${session.user.id}`)
})
