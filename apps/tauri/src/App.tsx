import { BetterAuth } from "@/lib/auth/better-auth"
import Auth from "@/pages/auth/Auth"
import GlobalError from "@/pages/GlobalError"
import Note from "@/pages/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "@/pages/notes/[workspaceId]/Layout"
import Workspace from "@/pages/notes/[workspaceId]/Workspace"
import NotesLayout from "@/pages/notes/Layout"
import Notes from "@/pages/notes/Notes"
import { Loading } from "@nuotes/components"
import { Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<BetterAuth />}>
            <Route index element={<Navigate to="/notes" replace />} />
            <Route path="auth" element={<Auth />} />
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
