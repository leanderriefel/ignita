import { useMemo } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "expo-router"
import { Text, TextInput, View } from "react-native"
import { z } from "zod"

import { useCreateNote } from "@ignita/hooks"
import { defaultNote, defaultTextNote, type Note } from "@ignita/lib/notes"

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

type CreateNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  parentId: string | null
}

export const CreateNoteDialog = ({
  open,
  onOpenChange,
  workspaceId,
  parentId,
}: CreateNoteDialogProps) => {
  const router = useRouter()

  const createNoteMutation = useCreateNote({
    onSuccess: (data) => {
      router.navigate(`/notes/${data.id}`)
    },
    onSettled: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
      type: "text" as Note["type"],
    },
    onSubmit: async ({ value }) => {
      createNoteMutation.mutate({
        workspaceId,
        parentId,
        name: value.name,
        note: defaultNote(value.type) ?? defaultTextNote,
      })
    },
  })

  const noteTypeOptions = useMemo(
    () => [
      { value: "text" as const, label: "Text" },
      { value: "directory" as const, label: "Directory" },
      { value: "board" as const, label: "Board" },
    ],
    [],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <View className="gap-4">
          <form.Field
            name="name"
            validators={{
              onBlur: z
                .string()
                .min(1, "Name is required")
                .max(12, "Name is too long"),
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

          <form.Field name="type">
            {(field) => (
              <View>
                <Text className="mb-2 text-sm text-foreground">Type</Text>
                <View className="flex-row gap-2">
                  {noteTypeOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      onPress={() => field.handleChange(opt.value)}
                      variant={
                        field.state.value === opt.value ? "secondary" : "ghost"
                      }
                      size="sm"
                    >
                      <Text>{opt.label}</Text>
                    </Button>
                  ))}
                </View>
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
          <Button
            className="grow"
            size="sm"
            disabled={createNoteMutation.isPending}
            onPress={() => {
              void form.handleSubmit()
            }}
          >
            {createNoteMutation.isPending ? (
              <Loading className="size-4" />
            ) : (
              <Text>Create</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateNoteDialog
