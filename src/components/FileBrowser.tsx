import { memo, useEffect, useMemo, useRef } from "react"
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
} from "@tw-material/file-browser"
import type {
  StateSnapshot,
  VirtuosoGridHandle,
  VirtuosoHandle,
} from "react-virtuoso"
import useBreakpoint from "use-breakpoint"

import { fileActions, useFileAction } from "@/hooks/useFileAction"
import { chainLinks } from "@/utils/common"
import {
  BREAKPOINTS,
  defaultSortState,
  defaultViewId,
  sortViewMap,
} from "@/utils/defaults"
import { filesQueryOptions, sessionQueryOptions } from "@/utils/queryOptions"
import { useModalStore } from "@/utils/store"

import { FileOperationModal } from "./modals/FileOperation"
import PreviewModal from "./modals/Preview"

let firstRender = true

function isVirtuosoList(value: any): value is VirtuosoHandle {
  return (value as VirtuosoHandle).getState !== undefined
}

const modalFileActions = [
  ChonkyActions.RenameFile.id,
  ChonkyActions.CreateFolder.id,
  ChonkyActions.DeleteFiles.id,
]

const fileRoute = getRouteApi("/_authenticated/$")

const positions = new Map<string, StateSnapshot>()

export const DriveFileBrowser = memo(() => {
  const { queryParams: params } = fileRoute.useRouteContext()

  const listRef = useRef<VirtuosoHandle | VirtuosoGridHandle>(null)

  const queryOptions = filesQueryOptions(params)

  const modalOpen = useModalStore((state) => state.open)

  const modalOperation = useModalStore((state) => state.operation)

  const { breakpoint } = useBreakpoint(BREAKPOINTS)

  const { data: session } = useQuery(sessionQueryOptions)

  const {
    data: files,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(queryOptions)

  const actionHandler = useFileAction(params, session!)

  const folderChain = useMemo(() => {
    if (params.type === "my-drive") {
      return Object.entries(chainLinks(params.path)).map(([key, value]) => ({
        id: key,
        name: key,
        path: value,
        isDir: true,
        chain: true,
      }))
    }

    return []
  }, [params.path, params.type])

  useEffect(() => {
    if (firstRender) {
      firstRender = false
      return
    }

    setTimeout(() => {
      listRef.current?.scrollTo({
        top: positions.get(params.type + params.path)?.scrollTop ?? 0,
        left: 0,
      })
    }, 0)

    return () => {
      if (listRef.current && isVirtuosoList(listRef.current))
        listRef.current?.getState((state) =>
          positions.set(params.type + params.path, state)
        )
    }
  }, [params.path, params.type])

  // const thumbnailGenerator = useCallback(
  //   (file: FileData) => {
  //     if (file.previewType === "image") {
  //       const mediaUrl = mediaUrl(file.id, file.name,session.hash)
  //       const url = new URL(mediaUrl)
  //       url.searchParams.set("w", "360")
  //       return settings.resizerHost
  //         ? `${settings.resizerHost}/${url.host}${url.pathname}${url.search}`
  //         : mediaUrl
  //     }

  //     return undefined
  //   },
  //   [settings.resizerHost]
  // )

  return (
    <div className="size-full m-auto">
      <FileBrowser
        files={files}
        folderChain={folderChain}
        onFileAction={actionHandler()}
        fileActions={fileActions}
        defaultFileViewActionId={defaultViewId}
        defaultSortActionId={
          params.type === "my-drive"
            ? defaultSortState.sortId
            : sortViewMap[params.type].sortId
        }
        defaultSortOrder={
          params.type === "my-drive"
            ? defaultSortState.order
            : sortViewMap[params.type].order
        }
        breakpoint={breakpoint}
      >
        {params.type === "my-drive" && <FileNavbar breakpoint={breakpoint} />}
        <FileToolbar className={params.type !== "my-drive" ? "pt-2" : ""} />
        <FileList
          hasNextPage={hasNextPage}
          isNextPageLoading={isFetchingNextPage}
          loadNextPage={fetchNextPage}
          ref={listRef}
        />
        <FileContextMenu />
      </FileBrowser>

      {modalFileActions.find((val) => val === modalOperation) && modalOpen && (
        <FileOperationModal queryKey={queryOptions.queryKey} />
      )}

      {modalOperation === ChonkyActions.OpenFiles.id && modalOpen && (
        <PreviewModal session={session!} files={files} />
      )}
    </div>
  )
})
