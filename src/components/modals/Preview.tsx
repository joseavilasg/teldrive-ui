import { lazy, memo, Suspense, useCallback, useState } from "react"
import type { ModalState, SetValue } from "@/types"
import { Icon } from "@iconify/react"
import {
  ChonkyIcon,
  ColorsLight,
  FileData,
  useIconData,
} from "@tw-material/file-browser"
import { Box, Button, cn, Modal, ModalContent } from "@tw-material/react"

import { useSession } from "@/hooks/useSession"
import Loader from "@/components/Loader"
import AudioPreview from "@/components/previews/audio/AudioPreview"
//import AudioPreview from "@/components/previews/audio/AudioPreview"
import DocPreview from "@/components/previews/DocPreview"
import FullScreenIFrame from "@/components/previews/FullScreenIFrame"
import ImagePreview from "@/components/previews/ImagePreview"
import PDFPreview from "@/components/previews/PdfPreview"
import { getMediaUrl } from "@/utils/common"
import { preview } from "@/utils/getPreviewType"

const VideoPreview = lazy(
  () => import("@/components/previews/video/VideoPreview")
)

const CodePreview = lazy(() => import("@/components/previews/CodePreview"))

const EpubPreview = lazy(() => import("@/components/previews/EpubPreview"))

type PreviewModalProps = {
  files: FileData[]
  modalState: Partial<ModalState>
  setModalState: SetValue<ModalState>
}
const findNext = (files: FileData[], fileId: string, previewType: string) => {
  let index = -1,
    firstPreviewIndex = -1

  for (let i = 0; i < files.length; i++) {
    const matchPreview =
      (previewType == "all" && files[i].previewType) ||
      files[i].previewType == previewType

    if (index > -1 && matchPreview) {
      return files[i]
    }

    if (firstPreviewIndex === -1 && matchPreview) {
      firstPreviewIndex = i
    }

    if (files[i].id === fileId) {
      index = i
    }
    if (i === files.length - 1) {
      return files[firstPreviewIndex]
    }
  }
}

const findPrev = (files: FileData[], fileId: string, previewType: string) => {
  let index = -1,
    lastPreviewIndex = -1
  for (let i = files.length - 1; i >= 0; i--) {
    const matchPreview =
      (previewType == "all" && files[i].previewType) ||
      files[i].previewType == previewType

    if (index > -1 && matchPreview) {
      return files[i]
    }
    if (lastPreviewIndex === -1 && matchPreview) {
      lastPreviewIndex = i
    }
    if (files[i].id === fileId) {
      index = i
    }

    if (i === 0) {
      return files[lastPreviewIndex]
    }
  }
}

interface ControlButtonProps {
  type: "next" | "prev"
  onPress: () => void
}

const ControlButton = ({ type, onPress }: ControlButtonProps) => {
  return (
    <Box
      className={cn(
        "w-10  opacity-0 data-[hover=true]:opacity-100 transition-opacity ease-out",
        "h-[calc(100vh-4rem)] mt-16 fixed  top-0 flex justify-center items-center",
        type === "next" ? "right-0" : "left-0"
      )}
    >
      <Button
        className="data-[hover=true]:bg-zinc-100/hover  text-gray-100 w-5 min-w-5 px-0"
        variant="text"
        onPress={onPress}
      >
        <Icon
          icon={
            type === "next"
              ? "ic:round-navigate-next"
              : "ic:round-navigate-before"
          }
        />
      </Button>
    </Box>
  )
}

export default memo(function PreviewModal({
  files,
  modalState,
  setModalState,
}: PreviewModalProps) {
  const { data: session } = useSession()

  const [previewFile, setPreviewFile] = useState(modalState.currentFile!)

  const { id, name, previewType, starred } = previewFile

  const { icon, colorCode } = useIconData({ id, name, isDir: false })

  const nextItem = useCallback(
    (previewType = "all") => {
      if (files) {
        const nextItem = findNext(files, id, previewType)
        if (nextItem) setPreviewFile(nextItem)
      }
    },
    [id, files]
  )

  const prevItem = useCallback(
    (previewType = "all") => {
      if (files) {
        const prevItem = findPrev(files, id, previewType)
        if (prevItem) setPreviewFile(prevItem)
      }
    },
    [id, files]
  )

  const handleClose = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }))
  }, [])

  const assetUrl = getMediaUrl(id, name, session?.hash!)

  const renderPreview = useCallback(() => {
    if (previewType) {
      switch (previewType) {
        case preview.video:
          return (
            <Suspense fallback={<Loader />}>
              <VideoPreview name={name} assetUrl={assetUrl} />
            </Suspense>
          )

        case preview.pdf:
          return (
            <FullScreenIFrame>
              <PDFPreview assetUrl={assetUrl} />
            </FullScreenIFrame>
          )

        case preview.office:
          return (
            <FullScreenIFrame>
              <DocPreview assetUrl={assetUrl} />
            </FullScreenIFrame>
          )

        case preview.code:
          return (
            <Suspense fallback={<Loader />}>
              <FullScreenIFrame>
                <CodePreview name={name} assetUrl={assetUrl} />
              </FullScreenIFrame>
            </Suspense>
          )

        case preview.image:
          return <ImagePreview name={name} assetUrl={assetUrl} />

        case preview.epub:
          return (
            <Suspense fallback={<Loader />}>
              <FullScreenIFrame>
                <EpubPreview assetUrl={assetUrl} />
              </FullScreenIFrame>
            </Suspense>
          )

        case preview.audio:
          return (
            <AudioPreview
              nextItem={nextItem}
              prevItem={prevItem}
              name={name}
              assetUrl={assetUrl}
            />
          )

        default:
          return null
      }
    }
    return null
  }, [assetUrl, name, previewType])

  return (
    <Modal
      aria-labelledby="preview-modal"
      isOpen={modalState.open as boolean}
      size="5xl"
      classNames={{
        wrapper: "overflow-hidden",
        base: "bg-transparent w-full shadow-none",
      }}
      placement="center"
      backdrop="blur"
      onClose={handleClose}
      hideCloseButton
    >
      <ModalContent>
        {id && (
          <>
            <div className="fixed top-0 left-0 h-16 w-full p-3 text-inherit flex justify-between">
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="text"
                  className="data-[hover=true]:bg-zinc-300/hover dark:data-[hover=true]:bg-zinc-500/hover text-gray-100"
                  onPress={handleClose}
                >
                  <Icon className="size-6" icon="ic:round-arrow-back" />
                </Button>
                <ChonkyIcon
                  icon={icon}
                  className={cn(ColorsLight[colorCode], "size-6 min-w-6")}
                />
                <h6
                  className="truncate text-label-large font-normal text-white"
                  title={name}
                >
                  {name}
                </h6>
              </div>
            </div>

            <ControlButton type="prev" onPress={() => prevItem()} />
            <ControlButton type="next" onPress={() => nextItem()} />
            {renderPreview()}
          </>
        )}
      </ModalContent>
    </Modal>
  )
})
