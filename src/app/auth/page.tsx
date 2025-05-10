import { AuthScreen } from "@/components/auth-screen"
import { ThemeSwitcher } from "@/components/theme-selector"

const AuthPage = async () => {
  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center p-4">
      <ThemeSwitcher className="absolute top-8 left-8" />
      <AuthScreen />
    </div>
  )
}

export default AuthPage
