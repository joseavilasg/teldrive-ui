import { useCallback } from "react"
import type { QueryParams, Session } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChonkyActions,
  ChonkyActionUnion,
  ChonkyIconName,
  defineFileAction,
  FileHelper,
  MapFileActionsToData,
  type FileData,
} from "@tw-material/file-browser"
import IconFlatColorIconsVlc from "~icons/flat-color-icons/vlc"
import IconLetsIconsViewAltFill from "~icons/lets-icons/view-alt-fill"

import { mediaUrl, navigateToExternalUrl } from "@/utils/common"
import { getSortState, SortOrder } from "@/utils/defaults"
import http from "@/utils/http"
import { usePreloadFiles } from "@/utils/queryOptions"
import { useModalStore } from "@/utils/store"

const CustomActions = {
  Preview: defineFileAction({
    id: "preview",
    requiresSelection: true,
    fileFilter: (file) => !file?.isDir,
    button: {
      name: "Preview",
      toolbar: true,
      group: "OpenOptions",
      contextMenu: true,
      icon: IconLetsIconsViewAltFill,
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
      icon: IconFlatColorIconsVlc,
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
}

type ChonkyActionFullUnion =
  | (typeof CustomActions)[keyof typeof CustomActions]
  | ChonkyActionUnion

export const useFileAction = (params: QueryParams) => {
  const queryClient = useQueryClient()

  const preloadFiles = usePreloadFiles()

  const actions = useModalStore((state) => state.actions)

  return useCallback(() => {
    return async (data: MapFileActionsToData<ChonkyActionFullUnion>) => {
      switch (data.id) {
        case ChonkyActions.OpenFiles.id: {
          const { targetFile, files } = data.payload

          const fileToOpen = targetFile ?? files[0]

          if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
            preloadFiles(fileToOpen.path, "my-drive")
          } else if (fileToOpen && FileHelper.isOpenable(fileToOpen)) {
            actions.set({
              open: true,
              currentFile: fileToOpen,
              operation: ChonkyActions.OpenFiles.id,
            })
          }

          break
        }
        case ChonkyActions.DownloadFiles.id: {
          const { selectedFiles } = data.state
          for (const file of selectedFiles) {
            if (!FileHelper.isDirectory(file)) {
              const { id, name } = file
              const url = mediaUrl(id, name, true)
              navigateToExternalUrl(url, false)
            }
          }
          break
        }
        case CustomActions.OpenInVLCPlayer.id: {
          const { selectedFiles } = data.state
          const fileToOpen = selectedFiles[0]
          const { id, name } = fileToOpen
          const url = `vlc://${mediaUrl(id, name)}`
          navigateToExternalUrl(url, false)
          break
        }
        case ChonkyActions.RenameFile.id: {
          actions.set({
            open: true,
            currentFile: data.state.selectedFiles[0],
            operation: ChonkyActions.RenameFile.id,
          })
          break
        }
        case ChonkyActions.DeleteFiles.id: {
          actions.set({
            open: true,
            selectedFiles: data.state.selectedFiles.map((item) => item.id),
            operation: ChonkyActions.DeleteFiles.id,
          })
          break
        }
        case ChonkyActions.CreateFolder.id: {
          actions.set({
            open: true,
            operation: ChonkyActions.CreateFolder.id,
            currentFile: {} as FileData,
          })
          break
        }
        case CustomActions.CopyDownloadLink.id: {
          const selections = data.state.selectedFilesForAction
          let clipboardText = ""
          selections.forEach((element) => {
            if (!FileHelper.isDirectory(element)) {
              const { id, name } = element
              clipboardText = `${clipboardText}${mediaUrl(id, name)}\n`
            }
          })
          navigator.clipboard.writeText(clipboardText)
          break
        }
        case ChonkyActions.MoveFiles.id: {
          const { files, target } = data.payload
          const res = await http.post("/api/files/move", {
            files: files.map((file) => file?.id),
            destination: target.path || "/",
          })
          if (res.status === 200) {
            queryClient.invalidateQueries({
              queryKey: ["files"],
            })
          }
          break
        }

        case ChonkyActions.EnableListView.id:
        case ChonkyActions.EnableGridView.id:
        case ChonkyActions.EnableTileView.id: {
          localStorage.setItem("viewId", data.id)
          break
        }
        case ChonkyActions.SortFilesByName.id:
        case ChonkyActions.SortFilesBySize.id:
        case ChonkyActions.SortFilesByDate.id: {
          if (params.type === "my-drive") {
            const currentSortState = getSortState()
            const order =
              currentSortState.order === SortOrder.ASC
                ? SortOrder.DESC
                : SortOrder.ASC
            localStorage.setItem(
              "sort",
              JSON.stringify({ sortId: data.id, order })
            )
          }
          break
        }
        default:
          break
      }
    }
  }, [params.type])
}

export const fileActions = Object.keys(CustomActions).map(
  (t) => CustomActions[t as keyof typeof CustomActions]
)
