import { ThemeSelector } from "../../../theme/theme-selector"
import { Label } from "../../../ui/label"

export const GeneralTab = () => {
  return (
    <div className="flex h-full flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="theme-selector">Theme</Label>
        <ThemeSelector id="theme-selector" />
      </div>
    </div>
  )
}
