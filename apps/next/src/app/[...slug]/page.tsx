"use client"

import nextDynamic from "next/dynamic"

const App = nextDynamic(() => import("~/router/App"), { ssr: false })

export const dynamic = "force-static"

const CatchAllPage = () => {
  return (
    <div className="relative h-dvh w-dvw">
      <App />
    </div>
  )
}

export default CatchAllPage
