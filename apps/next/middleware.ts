import { NextResponse, type NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "nuotes://",
  "http://tauri.localhost",
  "http://localhost:1420",
  "http://localhost:3000",
  "https://nuotes.vercel.app",
]

export const middleware = (request: NextRequest) => {
  const origin = request.headers.get("origin") ?? ""
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 })
    if (ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS,PUT,DELETE,PATCH",
      )
      const requestHeaders = request.headers.get(
        "access-control-request-headers",
      )
      if (requestHeaders) {
        response.headers.set("Access-Control-Allow-Headers", requestHeaders)
      }
    }
    return response
  }
  const response = NextResponse.next()
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }
  return response
}

export const config = {
  matcher: ["/api/:path*", "/callback/:path*"],
}
