"use client"

import Auth from "@/pages/auth/Auth"
import GlobalError from "@/pages/GlobalError"
import Landing from "@/pages/Landing"
import Note from "@/pages/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "@/pages/notes/[workspaceId]/Layout"
import Workspace from "@/pages/notes/[workspaceId]/Workspace"
import NotesLayout from "@/pages/notes/Layout"
import Notes from "@/pages/notes/Notes"
import { Loading } from "@nuotes/components"
import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/notes" element={<NotesLayout />}>
            <Route index element={<Notes />} />
            <Route path=":workspaceId" element={<WorkspaceLayout />}>
              <Route index element={<Workspace />} />
              <Route path=":noteId" element={<Note />} />
            </Route>
          </Route>
          <Route path="*" element={<GlobalError />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
