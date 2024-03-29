import { memo } from "react"

const PDFEmbedPreview = ({ assetUrl }: { assetUrl: string }) => {
  const url = `/pdf.js/web/viewer.html?file=${assetUrl}`
  return (
    <iframe
      title="PdfView"
      className="relative border-none z-50 size-full"
      src={url}
      allowFullScreen
    />
  )
}

export default memo(PDFEmbedPreview)
