import { Link } from "react-router"

import { Button, ThemeSelector } from "@ignita/components"

const Landing = () => {
  return (
    <div className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-y-4">
      <ThemeSelector className="absolute top-8 left-8" />
      ignita
      <Button asChild>
        <Link to="/notes">Get started</Link>
      </Button>
    </div>
  )
}

export default Landing
