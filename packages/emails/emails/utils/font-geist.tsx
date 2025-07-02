import { Font } from "@react-email/components"

export const GeistFont = () => {
  return (
    <Font
      fontFamily="Geist"
      fallbackFontFamily={["Verdana", "sans-serif"]}
      webFont={{
        url: "https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwcGFU.woff2",
        format: "woff2",
      }}
      fontWeight={400}
      fontStyle="normal"
    />
  )
}
