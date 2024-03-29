import { useCallback, useMemo } from "react"
import { Message, ModalState, QueryParams, SetValue } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChonkyActions,
  ChonkyActionUnion,
  ChonkyIconName,
  CustomVisibilityState,
  defineFileAction,
  FileHelper,
  MapFileActionsToData,
} from "@tw-material/file-browser"

import { useSession } from "@/hooks/useSession"
import { getMediaUrl, navigateToExternalUrl } from "@/utils/common"
import { preview } from "@/utils/getPreviewType"
import http from "@/utils/http"
import { usePreloadFiles } from "@/utils/queryOptions"

export const CustomActions = (isSm: boolean, type: string) => ({
  RenameFile: defineFileAction({
    id: "rename_file",
    requiresSelection: true,
    button: {
      name: "Rename",
      contextMenu: true,
      toolbar: true,
      iconOnly: true,
      icon: "material-symbols:edit-square-outline-rounded",
    },
  } as const),
  Preview: defineFileAction({
    id: "preview",
    requiresSelection: true,
    fileFilter: (file) => !file?.isDir,
    button: {
      name: "Preview",
      toolbar: true,
      group: "OpenOptions",
      contextMenu: true,
      icon: "lets-icons:view-alt-fill",
    },
  } as const),
  OpenInVLCPlayer: defineFileAction({
    id: "open_vlc_player",
    requiresSelection: true,
    fileFilter: (file) => file?.previewType === "video",
    button: {
      name: "Open In VLC",
      toolbar: true,
      group: "OpenOptions",
      icon: "flat-color-icons:vlc",
    },
  } as const),
  CopyDownloadLink: defineFileAction({
    id: "copy_link",
    requiresSelection: true,
    fileFilter: (file) => (file && "isDir" in file ? false : true),
    button: {
      name: "Copy Link",
      contextMenu: true,
      icon: ChonkyIconName.copy,
    },
  } as const),
  // GoToFolder: defineFileAction({
  //   id: "go_to_folder",
  //   requiresSelection: true,
  //   button: {
  //     name: "Go to folder",
  //     tooltip: "Go to folder",
  //     contextMenu: true,
  //     icon: ChonkyIconName.folder,
  //   },
  //   customVisibility: () =>
  //     type != "my-drive"
  //       ? CustomVisibilityState.Default
  //       : CustomVisibilityState.Hidden,
  // } as const),
})

type ChonkyActionFullUnion =
  | ReturnType<typeof CustomActions>[keyof ReturnType<typeof CustomActions>]
  | ChonkyActionUnion

export const useFileAction = (
  params: QueryParams,
  setModalState: SetValue<ModalState>,
  openUpload: () => void,
  openFileDialog: () => void
) => {
  const queryClient = useQueryClient()

  const isSm = false

  const preloadFiles = usePreloadFiles()

  const { data: session } = useSession()

  const { type } = params

  const fileActions = useMemo(
    () => CustomActions(isSm, params.type),
    [isSm, type]
  )

  const chonkyActionHandler = useCallback(() => {
    return async (data: MapFileActionsToData<ChonkyActionFullUnion>) => {
      switch (data.id) {
        case ChonkyActions.OpenFiles.id: {
          const { targetFile, files } = data.payload

          const fileToOpen = targetFile ?? files[0]

          if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
            preloadFiles(fileToOpen.path, "my-drive")
          }
          if (fileToOpen && fileToOpen.type === "file") {
            const previewType = fileToOpen.previewType as string
            if (!FileHelper.isDirectory(fileToOpen) && previewType in preview) {
              setModalState({
                open: true,
                currentFile: fileToOpen,
                operation: ChonkyActions.OpenFiles.id,
              })
            }
          }
          break
        }
        case fileActions.GoToFolder.id: {
          preloadFiles(data.state.selectedFiles[0].location, "my-drive")
          break
        }
        case ChonkyActions.DownloadFiles.id: {
          const { selectedFiles } = data.state
          for (const file of selectedFiles) {
            if (!FileHelper.isDirectory(file)) {
              const { id, name } = file
              const url = getMediaUrl(id, name, session?.hash!, true)
              navigateToExternalUrl(url, false)
            }
          }
          break
        }
        case fileActions.OpenInVLCPlayer.id: {
          const { selectedFiles } = data.state
          const fileToOpen = selectedFiles[0]
          const { id, name } = fileToOpen
          const url = `vlc://${getMediaUrl(id, name, session?.hash!)}`
          navigateToExternalUrl(url, false)
          break
        }
        case fileActions.RenameFile.id: {
          setModalState({
            open: true,
            currentFile: data.state.selectedFiles[0],
            operation: fileActions.RenameFile.id,
          })
          break
        }
        case ChonkyActions.DeleteFiles.id: {
          setModalState({
            open: true,
            selectedFiles: data.state.selectedFiles.map((item) => item.id),
            operation: ChonkyActions.DeleteFiles.id,
          })
          break
        }
        case ChonkyActions.CreateFolder.id: {
          setModalState({
            open: true,
            operation: ChonkyActions.CreateFolder.id,
          })
          break
        }
        case ChonkyActions.UploadFiles.id: {
          openUpload()
          openFileDialog()
          break
        }
        case fileActions.CopyDownloadLink.id: {
          const selections = data.state.selectedFilesForAction
          let clipboardText = ""
          selections.forEach((element) => {
            if (!FileHelper.isDirectory(element)) {
              const { id, name } = element
              clipboardText = `${clipboardText}${getMediaUrl(
                id,
                name,
                session?.hash!
              )}\n`
            }
          })
          navigator.clipboard.writeText(clipboardText)
          break
        }
        case ChonkyActions.MoveFiles.id: {
          const { files, target } = data.payload
          console.log(data.payload)
          // let res = await http.post<Message>("/api/files/move", {
          //   files: files.map((file) => file?.id),
          //   destination: target.path || "/",
          // })
          // if (res.status === 200) {
          //   queryClient.invalidateQueries({
          //     queryKey: ["files"],
          //   })
          // }
          break
        }
        case ChonkyActions.EnableGridView.id: {
          localStorage.setItem("view", "grid")
          break
        }

        case ChonkyActions.EnableListView.id: {
          localStorage.setItem("view", "list")
          break
        }
        default:
          break
      }
    }
  }, [type])

  return { fileActions, chonkyActionHandler }
}
