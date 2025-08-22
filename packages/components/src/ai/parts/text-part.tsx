import { memo, useMemo } from "react"
import type { TextUIPart } from "ai"
import { marked } from "marked"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import "./text-part.css"

export const TextPart = ({ part }: { part: TextUIPart }) => {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(part.text), [part.text])

  return (
    <div className="text-part space-y-3">
      {blocks.map((block, index) => (
        <TextPartBlock key={index} text={block} />
      ))}
    </div>
  )
}

const parseMarkdownIntoBlocks = (markdown: string) => {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

const TextPartBlock = memo(
  ({ text }: { text: string }) => {
    return (
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {text}
      </ReactMarkdown>
    )
  },
  (prev, next) => prev.text === next.text,
)
