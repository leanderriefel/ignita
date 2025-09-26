import { revalidateLogic } from "@tanstack/form-core"
import { useForm } from "@tanstack/react-form"
import { Text, TextInput, View } from "react-native"
import { toast } from "sonner"
import { z } from "zod"

import { useCreateWorkspace } from "@ignita/hooks"
import { setNote, setWorkspace } from "@ignita/lib"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Loading } from "~/components/ui/loading"

export const CreateWorkspaceDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const createWorkspaceMutation = useCreateWorkspace({
    onSuccess: (data) => {
      form.reset()
      onOpenChange(false)
      setWorkspace(data.id)
      setNote(null)
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unknown error occurred")
      }
    },
  })

  const form = useForm({
    defaultValues: {
      name: "workspace",
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      createWorkspaceMutation.mutate({ name: value.name })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new workspace</DialogTitle>
        </DialogHeader>
        <View className="gap-4">
          <form.Field
            name="name"
            validators={{
              onDynamic: z
                .string()
                .min(1, "Name is required")
                .max(20, "Name is too long"),
            }}
          >
            {(field) => (
              <View className="w-full">
                <Text className="mb-2 text-sm text-foreground">Name</Text>
                <TextInput
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  autoFocus
                  className="h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground"
                />
                {!field.state.meta.isValid ? (
                  <Text className="mt-1 text-xs text-destructive">
                    {field.state.meta.errors.map((e) => e?.message).join(", ")}
                  </Text>
                ) : null}
              </View>
            )}
          </form.Field>
        </View>
        <DialogFooter className="flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="grow">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting })}>
            {({ isSubmitting }) => (
              <Button
                className="grow"
                size="sm"
                disabled={createWorkspaceMutation.isPending || isSubmitting}
                onPress={() => {
                  void form.handleSubmit()
                }}
              >
                {createWorkspaceMutation.isPending || isSubmitting ? (
                  <Loading className="size-4" />
                ) : (
                  <Text>Create</Text>
                )}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspaceDialog
