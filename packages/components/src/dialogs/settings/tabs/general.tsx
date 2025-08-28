import {
  MonospaceFontSelector,
  TextFontSelector,
} from "../../../theme/font-selector"
import { ThemeSelector } from "../../../theme/theme-selector"
import { Label } from "../../../ui/label"

export const GeneralTab = () => {
  return (
    <div className="flex h-full flex-col gap-y-8">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="theme-selector">Theme</Label>
        <ThemeSelector id="theme-selector" />
      </div>
      <div className="flex gap-x-4">
        <div className="flex flex-col gap-y-2">
          <Label>Text Font</Label>
          <TextFontSelector />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Code Font</Label>
          <MonospaceFontSelector />
        </div>
      </div>
    </div>
  )
}
