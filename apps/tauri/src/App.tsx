import { authClient } from "@/lib/auth/auth-client"
import { QueryProvider } from "@/lib/trpc/query-provider"
import Auth from "@/pages/auth/Auth"
import GlobalError from "@/pages/GlobalError"
import Landing from "@/pages/Landing"
import Note from "@/pages/notes/[workspaceId]/[noteId]/Note"
import WorkspaceLayout from "@/pages/notes/[workspaceId]/Layout"
import Workspace from "@/pages/notes/[workspaceId]/Workspace"
import NotesLayout from "@/pages/notes/Layout"
import Notes from "@/pages/notes/Notes"
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react"
import { Loading } from "@nuotes/components"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

const App = () => {
  useBetterAuthTauri({
    authClient,
    scheme: "nuotes",
    debugLogs: process.env.NODE_ENV === "development",
    onRequest: (href) => {
      // eslint-disable-next-line no-console
      console.log("Auth request:", href)
    },
    onSuccess: (callbackURL) => {
      // eslint-disable-next-line no-console
      console.log("Auth successful:", callbackURL)
      // Navigate or update UI as needed
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Auth error:", error)
    },
  })

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
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
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
