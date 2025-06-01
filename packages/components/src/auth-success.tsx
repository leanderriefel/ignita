"use client"

export const AuthSuccess = () => {
  return (
    <div className="bg-card border-input flex max-w-full flex-col items-center justify-center gap-6 rounded-3xl border p-12 shadow-2xl">
      <h1 className="text-3xl font-bold">Authentication Successful!</h1>
      <p className="text-muted-foreground text-sm">
        Your authentication was successful. You may now close this window and
        return to the application.
      </p>
    </div>
  )
}
