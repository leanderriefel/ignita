"use client"

import nextDynamic from "next/dynamic"

const App = nextDynamic(() => import("~/router/App"), { ssr: false })

export const dynamic = "force-static"

const CatchAllPage = () => {
  return <App />
}

export default CatchAllPage
