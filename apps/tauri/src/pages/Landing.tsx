import { Button, ThemeSelector } from "@nuotes/components"
import { Link } from "react-router"

const Landing = () => {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-y-4 relative">
      <ThemeSelector className="absolute top-8 left-8" />
      nuotes
      <Button asChild>
        <Link to="/notes">Get started</Link>
      </Button>
    </div>
  )
}

export default Landing
