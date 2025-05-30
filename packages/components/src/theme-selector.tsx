import { useTheme } from "@/theme-provider"
import { Button } from "@/ui/button"
import { cn } from "@nuotes/lib"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"

export const ThemeSelector = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="square"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
    </Button>
  )
}
