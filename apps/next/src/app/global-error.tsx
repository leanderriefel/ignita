"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-dvh w-dvw items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Page Not Found</h1>
            <p className="text-gray-600">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default GlobalError
