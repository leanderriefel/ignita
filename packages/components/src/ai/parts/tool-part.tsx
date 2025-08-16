import type { ToolUIPart } from "ai"

export const ToolPart = ({
  part,
  text,
}: {
  part: ToolUIPart
  text: (output: ToolUIPart["output"]) => string
}) => {
  return (
    <div className="flex w-full flex-col gap-y-2 rounded-lg border p-4">
      <h3 className="text-sm font-bold">Called tool</h3>
      {part.state === "output-available" && (
        <p className="text-sm">{text(part.output)}</p>
      )}
    </div>
  )
}
