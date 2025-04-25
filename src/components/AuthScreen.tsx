import { signIn } from "@/auth"
import { Button } from "@/components/ui/Button"

export const AuthScreen = () => {
  return (
    <div className="max-w-full flex flex-col items-center justify-center gap-6 p-12 bg-card border border-card rounded-3xl">
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
