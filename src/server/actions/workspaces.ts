"use server"

import { auth } from "@/auth"
import { db } from "@/server/db"
import { workspaces } from "@/server/db/schema"

export const createWorkspace = async (name: string) => {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  return db.insert(workspaces).values({
    name,
    userId: session.user.id,
  })
}
