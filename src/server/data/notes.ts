import "server-only"

import { auth } from "@/auth"
import { db } from "@/server/db"
import { notes } from "@/server/db/schema"
import { sql } from "drizzle-orm"
import { cache } from "react"

// TODO: Check if workspace belongs to user
export const getNotes = cache(async (workspaceId: string) => {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  return await db
    .select()
    .from(notes)
    .where(sql`${notes.workspaceId} = ${workspaceId}`)
})
