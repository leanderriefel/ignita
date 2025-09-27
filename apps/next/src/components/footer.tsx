import Link from "next/link"

import { Button } from "@ignita/components"

export const Footer = () => {
  return (
    <div className="grid h-20 grid-cols-2 items-center border-t border-t-foreground bg-muted px-24">
      <p className="text-sm">© 2025 Leander Riefel</p>
      <div className="flex divide-x divide-foreground justify-self-end *:h-5 *:rounded-none *:px-4 *:text-xs">
        <Button variant="link" size="sm" asChild>
          <Link href="https://github.com/leanderriefel/ignita" target="_blank">
            GitHub
          </Link>
        </Button>
        <Button variant="link" size="sm" asChild>
          <Link href="/legal">Legal</Link>
        </Button>
      </div>
    </div>
  )
}
