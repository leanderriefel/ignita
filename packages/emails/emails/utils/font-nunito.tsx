import { Font } from "@react-email/components"

export const NunitoFont = () => {
  return (
    <Font
      fontFamily="Nunito"
      fallbackFontFamily={["Verdana", "sans-serif"]}
      webFont={{
        url: "https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaBTMnFcQ.woff2",
        format: "woff2",
      }}
      fontWeight={400}
      fontStyle="normal"
    />
  )
}
