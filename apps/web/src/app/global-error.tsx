"use client"

import posthog from "posthog-js"
import NextError from "next/error"
import { useEffect } from "react"

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}

export default GlobalError
