import { ThemeSwitcher } from "@/components/theme-selector"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const Landing = () => {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-y-4 relative">
      <ThemeSwitcher className="absolute top-8 left-8" />
      nuotes
      <Button asChild>
        <Link href="/notes" prefetch>
          Get started
        </Link>
      </Button>
    </div>
  )
}

export default Landing
