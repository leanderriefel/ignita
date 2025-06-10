import { Link, Navigate } from "react-router"

import { Button, ThemeSelector } from "@ignita/components"

const Landing = () => {
  // Redirect to last visited route if available
  const lastNotesPath = localStorage.getItem("pick-up-where-left-off")
  if (lastNotesPath && lastNotesPath !== "/notes") {
    return <Navigate to={lastNotesPath} replace />
  }

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
