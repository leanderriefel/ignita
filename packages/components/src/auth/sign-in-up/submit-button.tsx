import { Button } from "../../ui/button"
import { Loading } from "../../ui/loading"
import { useFormContext } from "./hooks"

export const AuthSubmitButton = ({ text }: { text: string }) => {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(formState) => ({
        canSubmit: formState.canSubmit,
        isSubmitting: formState.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          variant="secondary"
          className="mt-2 w-full"
          disabled={!canSubmit}
        >
          {isSubmitting ? <Loading className="size-4" /> : text}
        </Button>
      )}
    </form.Subscribe>
  )
}
