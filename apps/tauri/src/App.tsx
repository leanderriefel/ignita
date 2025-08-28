import { Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { AuthProvider, ResetPassword, Toaster } from "@ignita/components"
import { PostHogProvider } from "@ignita/posthog/provider"

import { authClient } from "~/lib/auth/auth-client"
import Auth from "~/router/auth/Auth"
import AuthSignup from "~/router/auth/signup/AuthSignup"
import GlobalError from "~/router/GlobalError"
import { NavigationProvider } from "~/router/navigation"
import NotesLayout from "~/router/notes/Layout"
import Notes from "~/router/notes/Notes"

const App = () => {
  return (
    <BrowserRouter>
      <NavigationProvider />
      <AuthProvider client={authClient}>
        <PostHogProvider
          authClient={authClient}
          apiHost={
            import.meta.env.DEV
              ? "http://localhost:3000/ingest"
              : "https://ignita.app/ingest"
          }
          postHogKey={import.meta.env.VITE_POSTHOG_KEY}
        >
          <Toaster />
          <Suspense>
            <Routes>
              <Route path="/">
                <Route index element={<Navigate to="/notes" replace />} />
                <Route path="auth">
                  <Route index element={<Auth />} />
                  <Route path="signup" element={<AuthSignup />} />
                </Route>
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="notes" element={<NotesLayout />}>
                  <Route index element={<Notes />} />
                </Route>
                <Route path="*" element={<GlobalError />} />
              </Route>
            </Routes>
          </Suspense>
        </PostHogProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
