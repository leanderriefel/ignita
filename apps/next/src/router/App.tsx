"use client"

import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

import { PostHogProvider } from "@ignita/posthog/provider"

import { authHooks } from "~/lib/auth/auth-client"
import { QueryProvider } from "~/lib/trpc/query-provider"
import Auth from "~/router/auth/Auth"
import AuthSignup from "~/router/auth/signup/AuthSignup"
import Note from "~/router/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "~/router/notes/[workspaceId]/Layout"
import Workspace from "~/router/notes/[workspaceId]/Workspace"
import NotesLayout from "~/router/notes/Layout"
import Notes from "~/router/notes/Notes"

const App = () => {
  return (
    <QueryProvider>
      <PostHogProvider
        authHooks={authHooks}
        apiHost="/ingest"
        postHogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      >
        <BrowserRouter>
          <Suspense>
            <Routes>
              <Route path="/auth">
                <Route index element={<Auth />} />
                <Route path="signup" element={<AuthSignup />} />
              </Route>
              <Route path="/notes" element={<NotesLayout />}>
                <Route index element={<Notes />} />
                <Route path=":workspaceId" element={<WorkspaceLayout />}>
                  <Route index element={<Workspace />} />
                  <Route path=":noteId" element={<Note />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PostHogProvider>
    </QueryProvider>
  )
}

export default App
