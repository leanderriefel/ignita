"use client"

import { Button } from "@/ui/button"

interface AuthScreenProps {
  onSignIn: () => void
}

export const AuthScreen = ({ onSignIn }: AuthScreenProps) => {
  return (
    <div className="bg-card border-input flex max-w-full flex-col items-center justify-center gap-6 rounded-3xl border p-12 shadow-2xl">
      <h1 className="text-3xl font-bold">Welcome to nuotes</h1>
      <Button variant="outline" onClick={onSignIn}>
        Sign in with Google
      </Button>
    </div>
  )
}
