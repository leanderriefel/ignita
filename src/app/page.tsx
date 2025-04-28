import { Button } from "@/components/ui/Button"
import Link from "next/link"

const Landing = () => {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-y-4">
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
