import { Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { Loading } from "@ignita/components"

import Auth from "~/pages/auth/Auth"
import AuthSignup from "~/pages/auth/signup/AuthSignup"
import GlobalError from "~/pages/GlobalError"
import Note from "~/pages/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "~/pages/notes/[workspaceId]/Layout"
import Workspace from "~/pages/notes/[workspaceId]/Workspace"
import NotesLayout from "~/pages/notes/Layout"
import Notes from "~/pages/notes/Notes"

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
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
    </BrowserRouter>
  )
}

export default App
