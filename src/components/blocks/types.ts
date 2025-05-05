export type Block = TextBlock | MediaBlock
export type BlockType = Block["type"]

export type TextBlock = {
  type: "text"
  text: string
}

export type MediaBlock = {
  type: "image" | "video" | "audio"
  url: string
  alt: string
}
