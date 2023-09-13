import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react"
import { FilePayload, FileResponse, Message, Settings, UploadPart } from "@/ui/types"
import {
  ChonkyIconFA,
  ColorsLight,
  defaultFormatters,
  FileData,
  useIconData,
} from "@bhunter179/chonky"
import {
  Cancel,
  CancelOutlined,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material"
import CloseIcon from "@mui/icons-material/Close"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { Box, darken, lighten, Paper, Typography } from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import Collapse from "@mui/material/Collapse"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ListSubheader from "@mui/material/ListSubheader"
import { UseMutationResult} from "@tanstack/react-query"
import md5 from "md5"
import pLimit from "p-limit"
import { useIntl } from "react-intl"
import { useParams } from "react-router-dom"

import { useCreateFile } from "@/ui/hooks/queryhooks"
import useHover from "@/ui/hooks/useHover"
import useSettings from "@/ui/hooks/useSettings"
import { getParams, getSortOrder, realPath, zeroPad } from "@/ui/utils/common"
import http from "@/ui/utils/http"
import { AxiosError } from "axios"
import toast from "react-hot-toast"

enum FileUploadStatus {
  NOT_STARTED,
  UPLOADING,
  UPLOADED,
  CANCELLED,
  FAILED,
}

interface FileUploadState {
  files: File[]
  currentFileIndex: number
  fileuploadProgress: number[]
  collapse: boolean
  visibility: boolean
  fileUploadStates: FileUploadStatus[]
  fileAbortControllers: AbortController[]
}

enum ActionTypes {
  SET_FILES = "SET_FILES",
  ADD_FILES = "ADD_FILES",
  SET_FILE_UPLOAD_STATUS = "SET_FILE_UPLOAD_STATUS",
  SET_UPLOAD_PROGRESS = "SET_UPLOAD_PROGRESS",
  SET_CURRENT_FILE_INDEX = "SET_CURRENT_FILE_INDEX",
  SET_UPLOAD_CANCELLED = "SET_UPLOAD_CANCELLED",
  TOGGLE_COLLAPSE = "TOGGLE_COLLAPSE",
  SET_VISIBILITY = "SET_VISIBILITY",
  SET_UPLOAD_STATE = "SET_UPLOAD_STATE",
}

type Action =
  | { type: ActionTypes.SET_FILES; payload: File[] }
  | { type: ActionTypes.ADD_FILES; payload: File[] }
  | {
      type: ActionTypes.SET_FILE_UPLOAD_STATUS
      payload: { fileIndex: number; status: FileUploadStatus }
    }
  | {
      type: ActionTypes.SET_UPLOAD_PROGRESS
      payload: { fileIndex: number; progress: number }
    }
  | { type: ActionTypes.SET_CURRENT_FILE_INDEX; payload: number }
  | { type: ActionTypes.TOGGLE_COLLAPSE }
  | { type: ActionTypes.SET_VISIBILITY; payload: boolean }

const initialState: FileUploadState = {
  files: [],
  currentFileIndex: 0,
  fileuploadProgress: [],
  collapse: true,
  visibility: false,
  fileUploadStates: [],
  fileAbortControllers: [],
}

const reducer = (state: FileUploadState, action: Action): FileUploadState => {
  switch (action.type) {
    case ActionTypes.SET_FILES:
      return {
        ...state,
        files: action.payload,
        fileUploadStates: action.payload.map(
          () => FileUploadStatus.NOT_STARTED
        ),
        fileAbortControllers: action.payload.map(() => new AbortController()),
        fileuploadProgress: action.payload.map(() => 0),
      }
    case ActionTypes.ADD_FILES:
      const fileUploadStates = action.payload.map(
        () => FileUploadStatus.NOT_STARTED
      )
      const fileAbortControllers = action.payload.map(
        () => new AbortController()
      )
      const fileuploadProgress = action.payload.map(() => 0)
      return {
        ...state,
        files: [...state.files, ...action.payload],
        fileUploadStates: [...state.fileUploadStates, ...fileUploadStates],
        fileAbortControllers: [
          ...state.fileAbortControllers,
          ...fileAbortControllers,
        ],
        fileuploadProgress: [
          ...state.fileuploadProgress,
          ...fileuploadProgress,
        ],
      }
    case ActionTypes.SET_UPLOAD_PROGRESS:
      const newFileUploadProgress = [...state.fileuploadProgress]
      newFileUploadProgress[action.payload.fileIndex] = action.payload.progress
      return {
        ...state,
        fileuploadProgress: newFileUploadProgress,
      }
    case ActionTypes.SET_CURRENT_FILE_INDEX:
      return { ...state, currentFileIndex: action.payload }
    case ActionTypes.TOGGLE_COLLAPSE:
      return { ...state, collapse: !state.collapse }
    case ActionTypes.SET_VISIBILITY:
      return { ...state, visibility: action.payload }
    case ActionTypes.SET_FILE_UPLOAD_STATUS:
      const newFileUploadStates = [...state.fileUploadStates]
      newFileUploadStates[action.payload.fileIndex] = action.payload.status
      return {
        ...state,
        fileUploadStates: newFileUploadStates,
      }
    default:
      return state
  }
}

type UploadEntryProps = {
  index: number
  name: string
  progress: number
  uploadState: FileUploadStatus
  size: number
  handleCancel: (index: number) => void
}

const UploadItemEntry = memo(
  ({
    index,
    name,
    progress,
    size,
    uploadState,
    handleCancel,
  }: UploadEntryProps) => {
    const { icon, colorCode } = useIconData({ name, isDir: false, id: "" })

    const [hoverRef, isHovered] = useHover<HTMLLIElement>()

    const intl = useIntl()

    const getProgress = useMemo(() => {
      if (uploadState == FileUploadStatus.UPLOADING)
        return `${defaultFormatters.formatFileSize(intl, {
          size: (progress / 100) * size,
        } as FileData)}/${defaultFormatters.formatFileSize(intl, {
          size,
        } as FileData)}`
      else if (uploadState == FileUploadStatus.UPLOADED) {
        return `${defaultFormatters.formatFileSize(intl, { size } as FileData)}`
      } else {
        return ""
      }
    }, [progress, size, uploadState])

    return (
      <ListItem ref={hoverRef}>
        <ListItemIcon>
          <ChonkyIconFA icon={icon} style={{ color: ColorsLight[colorCode] }} />
        </ListItemIcon>
        <ListItemText
          title={name}
          primaryTypographyProps={{
            sx: {
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            },
          }}
          primary={name}
          secondary={getProgress}
        />
        {isHovered && uploadState === FileUploadStatus.UPLOADING ? (
          <IconButton
            sx={{ color: "text.primary" }}
            onClick={() => handleCancel(index)}
          >
            <CancelOutlined />
          </IconButton>
        ) : (
          <Box sx={{ height: 40, width: 40 }}>
            {uploadState === FileUploadStatus.UPLOADING && (
              <Box sx={{ height: 40, width: 40, padding: 1 }}>
                <CircularProgress
                  size={24}
                  variant="determinate"
                  value={progress}
                />
              </Box>
            )}
            {uploadState === FileUploadStatus.UPLOADED && (
              <IconButton sx={{ color: "green" }}>
                <CheckCircleOutline />
              </IconButton>
            )}
            {uploadState === FileUploadStatus.FAILED && (
              <IconButton sx={{ color: "red" }}>
                <ErrorOutline />
              </IconButton>
            )}
            {uploadState === FileUploadStatus.CANCELLED && (
              <IconButton sx={{ color: "gray" }}>
                <Cancel />
              </IconButton>
            )}
          </Box>
        )}
      </ListItem>
    )
  }
)

interface UploadProps {
  hideUpload: () => void
  fileDialogOpened: boolean
  closeFileDialog: () => void
}

const uploadPart = async <T extends {}>(
  url: string,
  data: Blob,
  params: Record<string, string>,
  onProgress: (progress: number) => void,
  signal: AbortSignal
) => {
  return new Promise<T>(async (resolve, reject) => {
    try {
      const res = (
        await http.post<T>(url, data, {
          timeout: 0,
          signal,
          params,
          headers: { "Content-Type": "application/octet-stream" },
          onUploadProgress: (e) => {
            const progress = e.progress ? e.progress : 0
            onProgress(progress * 100)
          },
        })
      ).data
      resolve(res)
    } catch (error) {
      reject(error)
    }
  })
}

const uploadFile = async (
  file: File,
  path: string,
  createMutation: UseMutationResult<any, unknown, FilePayload, unknown>,
  settings: Settings,
  onProgress: (progress: number) => void,
  cancelSignal: AbortSignal
) => {
  return new Promise<boolean>(async (resolve, reject) => {
    
    //check if file exists

    const res= (await http.get<FileResponse>("/api/files",{params:{path,name:file.name,op:"find"}})).data

    if(res.results.length >0) {
      reject(new Error("duplicate file chnage name"))
      return
    }

    const totalParts = Math.ceil(file.size / settings.splitFileSize)

    const limit = pLimit(Number(settings.uploadConcurrency))

    const uploadId = md5(file.size.toString() + file.name + path)

    const url = `/api/uploads/${uploadId}`

    let partProgress: number[] = []

    const partUploadPromises: Promise<UploadPart>[] = []

    const partCancelSignals: AbortController[] = []

    for (let partIndex = 0; partIndex < totalParts; partIndex++) {
      const controller = new AbortController()

      partCancelSignals.push(controller)

      partUploadPromises.push(
        limit(() =>
          (async () => {
            const start = partIndex * settings.splitFileSize

            const end = Math.min(
              partIndex * settings.splitFileSize + settings.splitFileSize,
              file.size
            )

            const fileBlob = totalParts > 1 ? file.slice(start, end) : file

            const fileName =
              totalParts > 1
                ? `${file.name}.part.${zeroPad(partIndex + 1, 3)}`
                : file.name

            const params: Record<string, string> = {
              fileName,
              partNo: (partIndex + 1).toString(),
              totalparts: totalParts.toString(),
            }

            const asset = await uploadPart<UploadPart>(
              url,
              fileBlob,
              params,
              (progress) => {
                partProgress[partIndex] = progress
              },
              controller.signal
            )

            return asset
          })()
        )
      )
    }

    cancelSignal.addEventListener("abort", () => {
      partCancelSignals.forEach((controller) => {
        controller.abort()
      })
    })

    const timer = setInterval(() => {
      const totalProgress = partProgress.reduce(
        (sum, progress) => sum + progress,
        0
      )
      onProgress(totalProgress / totalParts)
    }, 1000)

    try {
      const parts = await Promise.all(partUploadPromises)
      const uploadParts = parts
        .sort((a, b) => a.partNo - b.partNo)
        .map((item) => ({ id: item.partId }))

      const payload = {
        name: file.name,
        mimeType: file.type ?? "application/octet-stream",
        type: "file",
        parts: uploadParts,
        size: file.size,
        path: path ? path : "/",
      }

      createMutation
        .mutateAsync({ payload })
        .then(async () => {
          await http.delete(`/api/uploads/${uploadId}`)
          resolve(true)
        })
        .catch(async(err) => {
          if ((err as AxiosError<Message>).response?.data?.error=="file exists") {
            await http.delete(`/api/uploads/${uploadId}`)
          }
          reject(err)
        })
    } catch (error) {
      reject(error)
    } finally {
      clearInterval(timer)
    }
  })
}

const Upload = ({
  hideUpload,
  fileDialogOpened,
  closeFileDialog,
}: UploadProps) => {
  const { settings } = useSettings()

  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    files,
    currentFileIndex,
    fileuploadProgress,
    collapse,
    visibility,
    fileUploadStates,
    fileAbortControllers,
  } = state

  const previndex = useRef(-1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const openFileSelector = useCallback(() => {
    fileInputRef?.current?.click()
    window.addEventListener(
      "focus",
      () => {
        if (fileInputRef.current?.files?.length == 0) closeFileDialog()
      },
      { once: true }
    )
  }, [])

  const handleCollapse = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_COLLAPSE })
  }, [dispatch])

  const handleClose = useCallback(() => {
    if (currentFileIndex < files.length) {
      if (!fileAbortControllers[currentFileIndex].signal.aborted)
        fileAbortControllers[currentFileIndex].abort()
    }
    hideUpload()
  }, [fileAbortControllers, currentFileIndex])

  const handleCancel = useCallback(
    (index: number) => {
      dispatch({
        type: ActionTypes.SET_FILE_UPLOAD_STATUS,
        payload: {
          fileIndex: index,
          status: FileUploadStatus.CANCELLED,
        },
      })
      fileAbortControllers[index].abort()
    },
    [fileAbortControllers]
  )

  useEffect(() => {
    if (fileDialogOpened) openFileSelector()
  }, [fileDialogOpened])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
      if (selectedFiles) {
        dispatch({ type: ActionTypes.SET_VISIBILITY, payload: true })
        dispatch({
          type: ActionTypes.ADD_FILES,
          payload: Array.from(selectedFiles),
        })
        closeFileDialog()
      }
    },
    []
  )
  useEffect(() => {
    if (
      fileUploadStates[currentFileIndex] == FileUploadStatus.CANCELLED &&
      currentFileIndex < files.length
    ) {
      dispatch({
        type: ActionTypes.SET_CURRENT_FILE_INDEX,
        payload: currentFileIndex + 1,
      })
    }
  }, [fileUploadStates])

  const params = getParams(useParams())
  const { path } = params

  const { mutation: createMutation } = useCreateFile(params)

  useEffect(() => {
    if (files.length > 0 && currentFileIndex < files.length) {
      if (previndex.current !== currentFileIndex) {
        dispatch({
          type: ActionTypes.SET_FILE_UPLOAD_STATUS,
          payload: {
            fileIndex: currentFileIndex,
            status: FileUploadStatus.UPLOADING,
          },
        })
        uploadFile(
          files[currentFileIndex],
          path,
          createMutation,
          settings,
          (progress) => {
            dispatch({
              type: ActionTypes.SET_UPLOAD_PROGRESS,
              payload: {
                fileIndex: currentFileIndex,
                progress,
              },
            })
          },
          fileAbortControllers[currentFileIndex].signal
        )
          .then(() => {
            dispatch({
              type: ActionTypes.SET_UPLOAD_PROGRESS,
              payload: {
                fileIndex: currentFileIndex,
                progress: 100,
              },
            })
            dispatch({
              type: ActionTypes.SET_FILE_UPLOAD_STATUS,
              payload: {
                fileIndex: currentFileIndex,
                status: FileUploadStatus.UPLOADED,
              },
            })
            dispatch({
              type: ActionTypes.SET_CURRENT_FILE_INDEX,
              payload: currentFileIndex + 1,
            })
            fileAbortControllers[currentFileIndex].abort()
          })
          .catch((err) => {
            if (err.name == "AbortError")
              dispatch({
                type: ActionTypes.SET_FILE_UPLOAD_STATUS,
                payload: {
                  fileIndex: currentFileIndex,
                  status: FileUploadStatus.CANCELLED,
                },
              })
            else
              dispatch({
                type: ActionTypes.SET_FILE_UPLOAD_STATUS,
                payload: {
                  fileIndex: currentFileIndex,
                  status: FileUploadStatus.FAILED,
                },
              })
             toast.error(err.message)
          })
        previndex.current = currentFileIndex
      }
    }
  }, [files, currentFileIndex])

  return (
    <>
      <Box
        component={"input"}
        ref={fileInputRef}
        onChange={handleFileChange}
        type="file"
        sx={{ display: "none" }}
        multiple
      />
      {visibility && (
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            position: "fixed",
            bottom: 0,
            right: 8,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            "@media (max-width: 1024px)": {
              bottom: 56,
            },
            background: (theme) =>
              theme.palette.mode === "dark"
                ? lighten(theme.palette.background.paper, 0.08)
                : darken(theme.palette.background.paper, 0.02),
          }}
          component={Paper}
          subheader={
            <ListSubheader
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" component="h6">
                {`Uploading ${files.length} file`}
              </Typography>
              <Box>
                <IconButton
                  sx={{ color: "text.primary" }}
                  onClick={handleCollapse}
                >
                  {collapse ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <IconButton
                  sx={{ color: "text.primary" }}
                  onClick={handleClose}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </ListSubheader>
          }
        >
          <Collapse
            in={collapse}
            timeout="auto"
            unmountOnExit
            sx={{ maxHeight: 200, overflow: "auto" }}
          >
            {files.length > 0 &&
              files.map((file, index) => (
                <UploadItemEntry
                  index={index}
                  key={index}
                  name={file.name}
                  size={file.size}
                  uploadState={fileUploadStates[index]}
                  handleCancel={handleCancel}
                  progress={fileuploadProgress[index]}
                />
              ))}
          </Collapse>
        </List>
      )}
    </>
  )
}

export default Upload
