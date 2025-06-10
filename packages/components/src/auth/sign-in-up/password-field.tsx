import { Input } from "../../ui/input"
import { useFieldContext } from "./hooks"

export const AuthPasswordField = () => {
  const field = useFieldContext<string>()

  return (
    <div className="space-y-2">
      <label htmlFor={field.name} className="text-sm font-medium">
        Password
      </label>
      <Input
        id={field.name}
        name={field.name}
        type="password"
        placeholder="Enter your password"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full"
      />
      {!field.state.meta.isValid ? (
        <p className="text-destructive text-sm">
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </p>
      ) : null}
    </div>
  )
}
