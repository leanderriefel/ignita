"use client"

import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

import { AuthProvider } from "@ignita/components"
import { PostHogProvider } from "@ignita/posthog/provider"

import { authClient } from "~/lib/auth/auth-client"
import NotesLayout from "~/router/notes/Layout"
import Notes from "~/router/notes/Notes"

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider client={authClient}>
        <PostHogProvider
          authClient={authClient}
          apiHost="/ingest"
          postHogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
        >
          <Suspense>
            <Routes>
              <Route path="/notes" element={<NotesLayout />}>
                <Route index element={<Notes />} />
              </Route>
            </Routes>
          </Suspense>
        </PostHogProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
