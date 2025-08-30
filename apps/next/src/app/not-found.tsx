import Link from "next/link"

import { Button } from "@ignita/components"

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="relative w-full max-w-md">
        {/* Background decorative elements */}
        <div className="absolute -top-48 -left-48 size-96 rounded-full bg-primary/10 blur-[128px]" />
        <div className="absolute -right-48 -bottom-48 size-96 rounded-full bg-accent/20 blur-[128px]" />

        {/* Main content card */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-card-foreground shadow-lg before:absolute before:inset-0 before:-z-1 before:rounded-2xl before:bg-gradient-to-b before:from-transparent before:to-primary/10 dark:before:to-primary/3">
          <div className="text-center">
            {/* 404 Number with custom styling */}
            <div className="relative mb-6">
              <h1 className="font-londrina text-8xl font-bold tracking-wider text-primary md:text-9xl">
                404
              </h1>
            </div>

            {/* Main heading */}
            <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
              Oops! Page not found
            </h2>

            {/* Description */}
            <p className="mb-8 text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Let&apos;s get you back on track.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/notes">
                  <svg
                    className="mr-2 size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Go to Notes
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/">
                  <svg
                    className="mr-2 size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Back Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
