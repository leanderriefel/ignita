import { Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { PostHogProvider } from "@ignita/posthog/provider"

import { authClient } from "~/lib/auth/auth-client"
import Auth from "~/router/auth/Auth"
import AuthSignup from "~/router/auth/signup/AuthSignup"
import GlobalError from "~/router/GlobalError"
import { NavigationProvider } from "~/router/navigation"
import Note from "~/router/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "~/router/notes/[workspaceId]/Layout"
import Workspace from "~/router/notes/[workspaceId]/Workspace"
import NotesLayout from "~/router/notes/Layout"
import Notes from "~/router/notes/Notes"

const App = () => {
  return (
    <BrowserRouter>
      <NavigationProvider />
      <PostHogProvider
        authClient={authClient}
        apiHost={
          import.meta.env.DEV
            ? "http://localhost:3000/ingest"
            : "https://ignita.app/ingest"
        }
        postHogKey={import.meta.env.VITE_POSTHOG_KEY}
      >
        <Suspense>
          <Routes>
            <Route path="/">
              <Route index element={<Navigate to="/notes" replace />} />
              <Route path="auth">
                <Route index element={<Auth />} />
                <Route path="signup" element={<AuthSignup />} />
              </Route>
              <Route path="notes" element={<NotesLayout />}>
                <Route index element={<Notes />} />
                <Route path=":workspaceId" element={<WorkspaceLayout />}>
                  <Route index element={<Workspace />} />
                  <Route path=":noteId" element={<Note />} />
                </Route>
              </Route>
              <Route path="*" element={<GlobalError />} />
            </Route>
          </Routes>
        </Suspense>
      </PostHogProvider>
    </BrowserRouter>
  )
}

export default App
