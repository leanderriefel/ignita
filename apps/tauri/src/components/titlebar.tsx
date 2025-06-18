import { useEffect, useState } from "react"
import {
  BoxIcon,
  CopyIcon,
  Cross1Icon,
  DividerHorizontalIcon,
} from "@radix-ui/react-icons"
import { getCurrentWindow } from "@tauri-apps/api/window"

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
      className="bg-border/50 fixed inset-x-0 top-0 z-[999] flex h-8 select-none"
    >
      <div className="m-1 flex h-full items-center gap-1">
        <img src="/128x128.png" className="m-1 size-5" alt="" />
        <p className="text-xs">Ignita</p>
      </div>
      <div className="ml-auto flex">
        <div
          className="hover:bg-accent m-1 inline-flex size-8 items-center justify-center rounded-[0.625rem] transition-colors select-none"
          onClick={() => void appWindow.minimize()}
        >
          <DividerHorizontalIcon className="size-3" />
        </div>
        {canMaximize && (
          <div
            className="hover:bg-accent m-1 inline-flex size-8 items-center justify-center rounded-[0.625rem] transition-colors select-none"
            onClick={() => void appWindow.toggleMaximize()}
          >
            {isMaximized ? (
              <CopyIcon className="size-3 -scale-x-100" />
            ) : (
              <BoxIcon className="size-3" />
            )}
          </div>
        )}
        <div
          className="hover:bg-accent m-1 inline-flex size-8 items-center justify-center rounded-[0.625rem] transition-colors select-none"
          onClick={() => void appWindow.close()}
        >
          <Cross1Icon className="size-3" />
        </div>
      </div>
    </div>
  )
}
