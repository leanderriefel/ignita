import { memo, useMemo } from "react"
import type { TextUIPart } from "ai"
import { marked } from "marked"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

export const TextPart = ({ text }: { text: TextUIPart }) => {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(text.text), [text.text])

  return (
    <div>
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
