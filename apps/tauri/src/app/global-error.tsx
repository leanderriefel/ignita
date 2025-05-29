"use client"

import NextError from "next/error"

const GlobalError = () => {
  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}

export default GlobalError
