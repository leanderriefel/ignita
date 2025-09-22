"use client"

import { useEffect, useMemo, useState } from "react"
import { useStore } from "@tanstack/react-store"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Folder,
  Grid,
  List,
  Plus,
  Search,
} from "lucide-react"
import { motion } from "motion/react"

import { useNotes } from "@ignita/hooks"
import { cn, notesSessionStore } from "@ignita/lib"

import { CreateNoteDialogTrigger } from "../../dialogs/create-note-dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Loading } from "../../ui/loading"
import { Toggle } from "../../ui/toggle"
import { NoteTitleStatus } from "../shared/note-title-status"
import type { NoteProp } from "../types"

type ViewMode = "grid" | "list"

export const DirectoryNoteView = ({
  note,
}: {
  note: NoteProp<"directory">
}) => {
  const { workspaceId } = useStore(notesSessionStore)
  const notes = useNotes(
    { workspaceId: workspaceId ?? "" },
    { enabled: !!workspaceId },
  )

  const [view, setView] = useState<ViewMode>("grid")
  const [onlyDirect, setOnlyDirect] = useState(true)
  const [query, setQuery] = useState("")
  const [asc, setAsc] = useState(true)

  useEffect(() => {
    setQuery("")
  }, [note.id])

  const descendants = useMemo(() => {
    if (!notes.data) return []

    const all = notes.data
    const result: typeof all = []

    if (onlyDirect) {
      for (const n of all) if (n.parentId === note.id) result.push(n)
    } else {
      const stack = all.filter((n) => n.parentId === note.id).map((n) => n.id)
      const byParent = new Map<string, string[]>()
      for (const n of all) {
        if (!n.parentId) continue
        const arr = byParent.get(n.parentId) ?? []
        arr.push(n.id)
        byParent.set(n.parentId, arr)
      }
      const visited = new Set<string>()
      while (stack.length) {
        const id = stack.pop() ?? ""
        if (visited.has(id)) continue
        visited.add(id)
        const node = all.find((n) => n.id === id)
        if (node) result.push(node)
        const children = byParent.get(id)
        if (children) stack.push(...children)
      }
    }

    const search = query.trim().toLowerCase()

    if (search) {
      const isSubsequence = (q: string, s: string) => {
        let i = 0
        for (let j = 0; j < s.length && i < q.length; j++)
          if (s[j] === q[i]) i++
        return i === q.length
      }

      const startsAtWord = (s: string, q: string) => {
        const tokens = s.split(/[^a-z0-9]+/i)
        for (const t of tokens) if (t.startsWith(q)) return true
        return false
      }

      const score = (name: string) => {
        const n = name.toLowerCase()
        if (n === search) return 0
        if (n.startsWith(search)) return 1
        if (startsAtWord(n, search)) return 2
        if (n.includes(search)) return 3
        if (isSubsequence(search, n)) return 4
        return Number.POSITIVE_INFINITY
      }

      const ranked = result
        .map((n) => ({ n, s: score(n.name) }))
        .filter((r) => Number.isFinite(r.s))
        .sort((a, b) =>
          a.s === b.s ? a.n.name.localeCompare(b.n.name) : a.s - b.s,
        )

      const topScore = ranked.length > 0 ? ranked[0]?.s : undefined
      const allSameBucket =
        typeof topScore !== "undefined" && ranked.every((r) => r.s === topScore)

      if (allSameBucket) {
        return ranked
          .map((r) => r.n)
          .sort((a, b) =>
            asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
          )
      }

      return ranked.map((r) => r.n)
    }

    return [...result].sort((a, b) =>
      asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    )
  }, [notes.data, note.id, onlyDirect, query, asc])

  const byParentCount = useMemo(() => {
    const map = new Map<string, number>()
    if (!notes.data) return map
    for (const n of notes.data) {
      if (!n.parentId) continue
      map.set(n.parentId, (map.get(n.parentId) ?? 0) + 1)
    }
    return map
  }, [notes.data])

  const parentOf = useMemo(() => {
    const map = new Map<string, string | null>()
    if (!notes.data) return map
    for (const n of notes.data) map.set(n.id, n.parentId)
    return map
  }, [notes.data])

  const nameOf = useMemo(() => {
    const map = new Map<string, string>()
    if (!notes.data) return map
    for (const n of notes.data) map.set(n.id, n.name)
    return map
  }, [notes.data])

  return (
    <div className="relative size-full">
      <div className="size-full overflow-x-hidden overflow-y-auto">
        <div className="mx-auto min-h-full max-w-5xl px-6 pt-20">
          <h1 className="hidden">{note.name}</h1>
          <NoteTitleStatus
            noteId={note.id}
            workspaceId={note.workspaceId}
            name={note.name}
            showStatus={false}
          />

          <div className="relative z-30 mt-6 flex flex-wrap items-center gap-2 pr-4">
            <div className="relative grow sm:max-w-80">
              <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search within directory"
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Toggle
              aria-label="Toggle direct children"
              pressed={onlyDirect}
              onPressedChange={(v) => setOnlyDirect(v)}
            >
              <Folder className="size-4" /> Direct children only
            </Toggle>
            <Button
              aria-label="Sort A-Z/Z-A"
              variant="ghost"
              onClick={() => setAsc(!asc)}
            >
              {asc ? (
                <ArrowDownAZ className="size-4" />
              ) : (
                <ArrowUpAZ className="size-4" />
              )}
              Sort
            </Button>
            <div className="pointer-events-auto relative z-30 ml-auto flex gap-1">
              <Toggle
                aria-label="Grid view"
                pressed={view === "grid"}
                onPressedChange={(v) => v && setView("grid")}
                onClick={() => setView("grid")}
              >
                <Grid className="size-4" />
              </Toggle>
              <Toggle
                aria-label="List view"
                pressed={view === "list"}
                onPressedChange={(v) => v && setView("list")}
                onClick={() => setView("list")}
              >
                <List className="size-4" />
              </Toggle>
            </div>
          </div>

          {notes.isPending && !!workspaceId && (
            <div className="flex justify-center py-12">
              <Loading className="size-6" />
            </div>
          )}

          {notes.isError && !!workspaceId && (
            <em className="block py-10 text-center text-sm text-destructive">
              Failed to load notes
            </em>
          )}

          {notes.isSuccess && descendants.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-2 text-sm text-muted-foreground">
                {query
                  ? "No matching descendant notes"
                  : onlyDirect
                    ? "No direct children in this directory"
                    : "No descendants in this directory"}
              </p>
              <CreateNoteDialogTrigger
                workspaceId={note.workspaceId}
                parentId={note.id}
                parentName={note.name}
                asChild
              >
                <Button variant="outline">Create a note here</Button>
              </CreateNoteDialogTrigger>
            </motion.div>
          )}

          {notes.isSuccess && descendants.length > 0 && (
            <motion.div
              className={cn(
                "mt-6",
                view === "grid"
                  ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
                  : "divide-y rounded-lg border",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {descendants.map((n, idx) => {
                const pathParts: string[] = []
                let pid = parentOf.get(n.id) ?? null
                while (pid && pid !== note.id) {
                  const name = nameOf.get(pid)
                  if (name) pathParts.unshift(name)
                  pid = parentOf.get(pid) ?? null
                }
                const pathLabel = pathParts.join(" > ")

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.015 }}
                    className={cn(
                      view === "grid"
                        ? "group flex items-start justify-between gap-2 rounded-lg border bg-card p-3 shadow-xs transition-colors hover:bg-accent/40"
                        : "flex items-center justify-between p-3",
                    )}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden pr-2">
                      <div className="truncate text-sm font-medium">
                        {n.name}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {pathParts.length > 0 ? (
                          <div className="flex min-w-0 items-center gap-1">
                            <span className="shrink-0">Inside</span>
                            <span className="truncate">{pathLabel}</span>
                          </div>
                        ) : (
                          <>{byParentCount.get(n.id) ?? 0} items</>
                        )}
                      </div>
                    </div>
                    <CreateNoteDialogTrigger
                      workspaceId={n.workspaceId}
                      parentId={n.id}
                      parentName={n.name}
                      asChild
                      className="ml-2 shrink-0"
                    >
                      <Button
                        variant="ghost"
                        size={view === "grid" ? "square" : "xs"}
                        className={cn(view === "grid" ? "self-start" : "")}
                        aria-label="Create child note"
                        title="Create child note"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </CreateNoteDialogTrigger>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
