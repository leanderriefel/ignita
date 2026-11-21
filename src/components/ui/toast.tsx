import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  toast,
} from "@ui-sdk/react/toast";

import { CloseIcon } from "./icons";

export function Toaster() {
  return (
    <ToastRegion
      aria-label="Notifications"
      className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-32px)] max-w-[360px] flex-col gap-2 outline-none sm:right-6 sm:bottom-6"
    >
      {() => (
        <Toast className="flex items-start justify-between gap-3 rounded-[10px] bg-popover p-3.5 text-[13px] text-fg hairline-strong shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle className="font-medium text-fg" />
            <ToastDescription className="text-meta-fg" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ToastAction className="inline-flex h-7 cursor-pointer items-center rounded-[6px] bg-control px-2.5 text-[13px] font-medium text-fg hairline transition-colors hover:bg-control-active" />
            <ToastClose
              aria-label="Dismiss notification"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-meta-fg transition-colors hover:bg-control hover:text-fg"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </ToastClose>
          </div>
        </Toast>
      )}
    </ToastRegion>
  );
}

export { toast };
