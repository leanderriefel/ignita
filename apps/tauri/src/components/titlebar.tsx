import { useEffect, useState } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { CopyIcon, MinusIcon, SquareIcon, XIcon } from "lucide-react"

export const Titlebar = () => {
  const appWindow = getCurrentWindow()

  const [canMaximize, setCanMaximize] = useState(true)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    let unlisten: (() => void) | undefined

    const init = async () => {
      setCanMaximize(await appWindow.isMaximizable())
      setIsMaximized(await appWindow.isMaximized())

      unlisten = await appWindow.onResized(async () => {
        setIsMaximized(await appWindow.isMaximized())
      })
    }

    init()

    return () => {
      if (unlisten) unlisten()
    }
  }, [appWindow])

  return (
    <div
      data-tauri-drag-region
      className="fixed inset-x-0 top-0 z-40 flex h-10 items-center bg-muted select-none"
    >
      <div className="flex h-full items-center gap-2">
        <img src="/128x128.png" className="ml-2.5 size-5" alt="" />
        <p className="text-xs">Ignita</p>
      </div>
      <div className="ml-auto flex items-center">
        <div
          className="m-1 inline-flex size-8 items-center justify-center rounded-[0.625rem] transition-colors select-none hover:bg-border"
          onClick={() => void appWindow.minimize()}
        >
          <MinusIcon className="size-3" />
        </div>
        {canMaximize && (
          <div
            className="m-1 inline-flex size-8 items-center justify-center rounded-[0.625rem] transition-colors select-none hover:bg-border"
            onClick={() => void appWindow.toggleMaximize()}
          >
            {isMaximized ? (
              <CopyIcon className="size-3 -scale-x-100" />
            ) : (
              <SquareIcon className="size-3" />
            )}
          </div>
        )}
        <div
          className="m-1 inline-flex size-8 items-center justify-center rounded-xs transition-colors select-none hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => void appWindow.close()}
        >
          <XIcon className="size-3" />
        </div>
      </div>
    </div>
  )
}
