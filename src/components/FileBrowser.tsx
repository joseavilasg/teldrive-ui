import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ModalState } from "@/types"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
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
import { useBoolean } from "usehooks-ts"

import { useFileAction } from "@/hooks/useFileAction"
import { useSession } from "@/hooks/useSession"
import useSettings from "@/hooks/useSettings"
import { defaultSortState } from "@/hooks/useSortFilter"
import { chainLinks, getMediaUrl } from "@/utils/common"
import { filesQueryOptions } from "@/utils/queryOptions"

// import DeleteDialog from "./dialogs/Delete"
// import ErrorView from "./ErrorView"
// import FileModal from "./modals/FileOperation"
import PreviewModal from "./modals/Preview"

// import Upload from "./Uploader"

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

export const DriveFileBrowser = () => {
  const positions = useRef<Map<string, StateSnapshot>>(new Map()).current

  const { queryParams: params } = fileRoute.useRouteContext()

  const {
    value: upload,
    setTrue: showUpload,
    setFalse: hideUpload,
  } = useBoolean(false)

  const {
    value: fileDialogOpened,
    setTrue: openFileDialog,
    setFalse: closeFileDialog,
  } = useBoolean(false)

  const listRef = useRef<VirtuosoHandle | VirtuosoGridHandle>(null)

  const queryOptions = filesQueryOptions(params)

  const {
    data: files,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSuspenseInfiniteQuery(queryOptions)

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
  }, [params.path, params.type])

  const [modalState, setModalState] = useState<ModalState>({
    open: false,
  })

  const { fileActions, chonkyActionHandler } = useFileAction(
    params,
    setModalState,
    showUpload,
    openFileDialog
  )

  const { open } = modalState

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

  // if (error) {
  //   return <ErrorView error={error as Error} />
  // }

  const defaultView = "list"

  const { settings } = useSettings()

  const { data: session } = useSession()

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
    },
    [settings.resizerHost]
  )

  const actions = useMemo(
    () =>
      Object.keys(fileActions).map(
        (x) => fileActions[x as keyof typeof fileActions]
      ),
    [params.path, params.type]
  )

  return (
    <div className="size-full m-auto">
      <FileBrowser
        files={files}
        folderChain={folderChain}
        onFileAction={chonkyActionHandler()}
        fileActions={actions}
        fileActionGroups={fileActionGroups}
        defaultFileViewActionId={viewMap[defaultView as "list" | "grid"]}
        defaultSortActionId={sortMap[defaultSortState[params.type].sort]}
        defaultSortOrder={defaultSortState[params.type].order}
        thumbnailGenerator={thumbnailGenerator}
      >
        <FileNavbar />
        <FileToolbar />
        <FileList
          hasNextPage={hasNextPage}
          isNextPageLoading={isFetchingNextPage}
          loadNextPage={fetchNextPage}
          ref={listRef}
        />
        <FileContextMenu />
      </FileBrowser>
      {/* {["rename_file", ChonkyActions.CreateFolder.id].find(
        (val) => val === modalState.operation
      ) &&
        open && (
          <FileModal
            queryKey={queryOptions.queryKey}
            modalState={modalState}
            setModalState={setModalState}
          />
        )} */}
      {modalState.operation === ChonkyActions.OpenFiles.id && open && (
        <PreviewModal
          files={files!}
          modalState={modalState}
          setModalState={setModalState}
        />
      )}
      {/* {modalState.operation === "delete_file" && open && (
        <DeleteDialog
          queryKey={queryOptions.queryKey}
          modalState={modalState}
          setModalState={setModalState}
        />
      )}
      {upload && (
        <Upload
          queryKey={queryOptions.queryKey}
          fileDialogOpened={fileDialogOpened}
          closeFileDialog={closeFileDialog}
          hideUpload={hideUpload}
        />
      )} */}
    </div>
  )
}
