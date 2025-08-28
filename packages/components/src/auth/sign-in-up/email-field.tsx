import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { useFieldContext } from "./hooks"

export const AuthEmailField = () => {
  const field = useFieldContext<string>()

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Email address</Label>
      <Input
        id={field.name}
        name={field.name}
        type="email"
        placeholder="Enter your email"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full"
      />
      {!field.state.meta.isValid ? (
        <p className="text-sm text-destructive">
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </p>
      ) : null}
    </div>
  )
}
