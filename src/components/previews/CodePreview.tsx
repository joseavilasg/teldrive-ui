import { memo } from "react"
import Editor from "@monaco-editor/react"

import useFileContent from "@/hooks/useFileContent"
import { getLanguageByFileName } from "@/utils/getPreviewType"

interface CodePreviewProps {
  name: string
  assetUrl: string
}
const CodePreview = ({ name, assetUrl }: CodePreviewProps) => {
  const { response: content, error, validating } = useFileContent(assetUrl)

  return (
    <>
      {validating ? null : (
        <Editor
          options={{
            readOnly: true,
          }}
          language={getLanguageByFileName(name)}
          theme="vs-dark"
          height="100%"
          value={content}
        />
      )}
    </>
  )
}

export default memo(CodePreview)
