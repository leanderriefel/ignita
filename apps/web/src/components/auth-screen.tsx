import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export const AuthScreen = async () => {
  return (
    <div className="bg-card border-input flex max-w-full flex-col items-center justify-center gap-6 rounded-3xl border p-12 shadow-2xl">
      <h1 className="text-3xl font-bold">Welcome to nuotes</h1>
      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/notes" })
        }}
      >
        <Button variant="outline">Sign in with Google</Button>
      </form>
    </div>
  )
}
