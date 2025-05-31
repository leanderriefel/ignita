"use client"

import Auth from "@/router/auth/Auth"
import GlobalError from "@/router/GlobalError"
import Landing from "@/router/Landing"
import Note from "@/router/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "@/router/notes/[workspaceId]/Layout"
import Workspace from "@/router/notes/[workspaceId]/Workspace"
import NotesLayout from "@/router/notes/Layout"
import Notes from "@/router/notes/Notes"
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
