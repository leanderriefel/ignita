import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

import { AuthEmailField } from "./email-field"
import { AuthNameField } from "./name-field"
import { AuthPasswordField } from "./password-field"
import { AuthSubmitButton } from "./submit-button"

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    AuthEmailField,
    AuthPasswordField,
    AuthNameField,
  },
  formComponents: {
    AuthSubmitButton,
  },
})
