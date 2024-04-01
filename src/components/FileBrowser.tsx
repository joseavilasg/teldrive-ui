import { useCallback, useEffect, useMemo, useRef } from "react"
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
  type FileData,
} from "@tw-material/file-browser"
import type {
  StateSnapshot,
  VirtuosoGridHandle,
  VirtuosoHandle,
} from "react-virtuoso"
import useBreakpoint from "use-breakpoint"
import { useLocalStorage } from "usehooks-ts"

import { fileActions, useFileAction } from "@/hooks/useFileAction"
import useSettings from "@/hooks/useSettings"
import { defaultSortState } from "@/hooks/useSortFilter"
import { chainLinks, getMediaUrl } from "@/utils/common"
import { filesQueryOptions, sessionQueryOptions } from "@/utils/queryOptions"
import { useModalStore } from "@/utils/store"

import { FileOperationModal } from "./modals/FileOperation"
import PreviewModal from "./modals/Preview"

const fileActionGroups = {
  OpenOptions: {
    sortOrder: -1,
    icon: "majesticons:open-line",
    tooltip: "Open Options",
  },
}

let firstRender = true

function isVirtuosoList(value: any): value is VirtuosoHandle {
  return (value as VirtuosoHandle).getState !== undefined
}

const sortMap = {
  name: ChonkyActions.SortFilesByName.id,
  updatedAt: ChonkyActions.SortFilesByDate.id,
  size: ChonkyActions.SortFilesBySize.id,
} as const

const viewMap = {
  list: ChonkyActions.EnableListView.id,
  grid: ChonkyActions.EnableGridView.id,
  tile: ChonkyActions.EnableTileView.id,
} as const

const fileRoute = getRouteApi("/_authenticated/$")

const BREAKPOINTS = { xs: 0, sm: 476, md: 576, lg: 992 }

const modalFileActions = [
  ChonkyActions.RenameFile.id,
  ChonkyActions.CreateFolder.id,
  ChonkyActions.DeleteFiles.id,
]

export const DriveFileBrowser = () => {
  const positions = useRef<Map<string, StateSnapshot>>(new Map()).current

  const { queryParams: params } = fileRoute.useRouteContext()

  const listRef = useRef<VirtuosoHandle | VirtuosoGridHandle>(null)

  const queryOptions = filesQueryOptions(params)

  const [view, setView] = useLocalStorage("view", "list")

  const viewRef = useRef(viewMap[view] ?? ChonkyActions.EnableListView.id)

  const modalOpen = useModalStore((state) => state.open)

  const modalOperation = useModalStore((state) => state.operation)

  const { breakpoint } = useBreakpoint(BREAKPOINTS)

  const {
    data: files,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSuspenseInfiniteQuery(queryOptions)

  const { chonkyActionHandler } = useFileAction(params, setView)

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

  const { settings } = useSettings()

  const { data: session } = useQuery(sessionQueryOptions)

  const thumbnailGenerator = useCallback(
    (file: FileData) => {
      if (file.previewType === "image") {
        const mediaUrl = getMediaUrl(file.id, file.name, session?.hash!)
        const url = new URL(mediaUrl)
        url.searchParams.set("w", "360")
        return settings.resizerHost
          ? `${settings.resizerHost}/${url.host}${url.pathname}${url.search}`
          : mediaUrl
      }

      return undefined
    },
    [settings.resizerHost]
  )

  return (
    <div className="size-full m-auto">
      <FileBrowser
        files={files}
        folderChain={folderChain}
        onFileAction={chonkyActionHandler()}
        fileActions={fileActions}
        fileActionGroups={fileActionGroups}
        defaultFileViewActionId={viewRef.current}
        defaultSortActionId={sortMap[defaultSortState[params.type].sort]}
        defaultSortOrder={defaultSortState[params.type].order}
        thumbnailGenerator={thumbnailGenerator}
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
        <PreviewModal files={files!} />
      )}
    </div>
  )
}
