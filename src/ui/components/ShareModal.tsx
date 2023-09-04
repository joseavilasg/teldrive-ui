import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react"
import {
  ModalState,
  QueryParams,
  SharedFile,
  ShareFilePayload,
  ShareUserPayload,
  User,
} from "@/ui/types"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  MenuItem,
  Switch,
} from "@mui/material"
import Avatar from "@mui/material/Avatar"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Fade from "@mui/material/Fade"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import Modal from "@mui/material/Modal"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { capitalize } from "@mui/material/utils"
import { styled } from "@mui/system"
import { useBoolean } from "usehooks-ts"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

import {
  useShareFile,
  useShareQuery,
  useUsersQuery,
} from "@/ui/hooks/queryhooks"
import { getShareableUrl } from "@/ui/utils/common"

import SwitchLoader from "./SwitchLoader"

const StyledPaper = styled(Paper)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 700,
  margin: "0 40px 0 0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "2rem",
  padding: 24,
  "@media (max-width: 480px)": {
    width: 300,
  },
})

type FileModalProps = {
  modalState: Partial<ModalState>
  setModalState: Dispatch<SetStateAction<Partial<ModalState>>>
  queryParams: Partial<QueryParams>
}

const permissions = [
  {
    value: "write",
    label: "Write",
  },
  {
    value: "read",
    label: "Read",
  },
  {
    value: "remove",
    label: "Remove Access",
  },
]

const generalAccess = [
  {
    value: "public",
    label: "Public",
  },
  {
    value: "disabled",
    label: "Disabled",
  },
]

function SharedUser({
  sharedWithFullName,
  sharedWithUserName,
  permission,
  index,
}: SharedFile & { index: number }) {
  const state = useShareStore()

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={sharedWithFullName} />
      </ListItemAvatar>
      <ListItemText
        primary={sharedWithFullName}
        secondary={
          <Typography
            sx={{ display: "inline" }}
            component="span"
            variant="body2"
            color="text.primary"
          >
            {sharedWithUserName}
          </Typography>
        }
      />
      <TextField
        sx={{ width: "40%" }}
        select
        label="Permissions"
        fullWidth
        value={permission}
        onChange={(e) => {
          state.updateSharedUser(index, e.target.value)
        }}
      >
        {permissions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </ListItem>
  )
}

interface ShareState {
  currentSharedUsers: SharedFile[]
  newSharedUsers: User[]
  newPermission: string
  isPublic: boolean
  isDisabled: boolean
  setCurrentSharedUser: (payload: SharedFile[]) => void
  updateSharedUser: (index: number, payload: string) => void
  setNewSharedUser: (payload: User[]) => void
  setNewPermission: (payload: string) => void
  setIsPublic: (payload: boolean) => void
  setIsDisabled: (payload: boolean) => void
}

const useShareStore = create(
  immer<ShareState>((set) => ({
    currentSharedUsers: [],
    newSharedUsers: [],
    newPermission: "write",
    isPublic: false,
    isDisabled: true,
    setCurrentSharedUser: (payload: SharedFile[]) =>
      set((state) => {
        state.currentSharedUsers = payload
      }),
    updateSharedUser: (index: number, payload: string) =>
      set((state) => {
        state.currentSharedUsers[index].permission = payload
      }),
    setNewSharedUser: (payload: User[]) =>
      set((state) => {
        state.newSharedUsers = payload
      }),
    setNewPermission: (payload: string) =>
      set((state) => {
        state.newPermission = payload
      }),
    setIsPublic: (payload: boolean) =>
      set((state) => {
        state.isPublic = payload
      }),
    setIsDisabled: (payload: boolean) =>
      set((state) => {
        state.isDisabled = payload
      }),
  }))
)

export default memo(function ShareModal({
  modalState,
  setModalState,
  queryParams,
}: FileModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { open, file } = modalState

  const { data, isInitialLoading } = useShareQuery(file?.id as string)

  const { value, setFalse, setTrue } = useBoolean(false)

  const { data: userData, isInitialLoading: loading } = useUsersQuery(value)

  const { mutation: shareMutation } = useShareFile(file?.id!)

  const state = useShareStore()

  const handleCopyClick = () => {
    if (inputRef.current) {
      inputRef.current.select()
      navigator.clipboard.writeText(inputRef.current.value)
    }
  }

  const handleUsernamesChange = useCallback(
    (_: React.SyntheticEvent<Element, Event>, value: User[]) => {
      state.setNewSharedUser(value)
    },
    []
  )

  const handleClose = useCallback(
    () => setModalState((prev) => ({ ...prev, open: false })),
    []
  )

  useEffect(() => {
    if (data) {
      if (data.length == 1 && !data[0].sharedWith) state.setIsPublic(true)
      else if (data.length == 0) state.setIsDisabled(true)
      else state.setCurrentSharedUser(data)
    }
  }, [data])

  const sharePayload = useMemo<ShareFilePayload>(() => {
    let users: ShareUserPayload[] = []

    if (state.isPublic) {
    }
    users = users.concat(
      state.newSharedUsers.map<ShareUserPayload>((user) => ({
        userId: user.userId,
        operation: "add",
        permission: state.newPermission,
      }))
    )

    state.currentSharedUsers.map((user, index) => {
      if (data && user.permission !== data[index].permission) {
        if (user.permission === "remove") {
          users.push({
            userId: user.sharedWith,
            operation: "remove",
          })
        } else {
          users.push({
            userId: user.sharedWith,
            operation: "update",
            permission: user.permission,
          })
        }
      }
    })

    return { users, operation: "modifyusers" }
  }, [state])

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={!!open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <StyledPaper elevation={3}>
          <Box sx={{ width: 1 }}>
            <Typography
              className="transition-modal-title"
              variant="h6"
              component="h2"
              fontWeight={600}
              sx={{ mb: 2 }}
            >
              Share: {file?.name}
            </Typography>
            <Divider flexItem role="presentation" />
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              gap: "1rem",
            }}
          >
            <Autocomplete
              open={value}
              onOpen={setTrue}
              onClose={setFalse}
              sx={{ flex: 2 }}
              multiple
              id="tags-outlined"
              getOptionLabel={(option) => option.userName}
              loading={loading}
              options={userData ? userData : []}
              filterSelectedOptions
              onChange={handleUsernamesChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add user"
                  placeholder="username"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {state.newSharedUsers.length > 0 && (
              <TextField sx={{ flex: 1 }} select label="Permissions" fullWidth>
                {permissions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
          <Box sx={{ width: "100%" }}>
            {!isInitialLoading && (
              <>
                {state.currentSharedUsers.length > 0 && (
                  <List
                    sx={{
                      width: "100%",
                      maxHeight: "33vh",
                      bgcolor: "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      overflowY: "auto",
                    }}
                  >
                    {state.currentSharedUsers.map((item, index) => (
                      <SharedUser
                        key={item.sharedWith}
                        index={index}
                        {...item}
                      ></SharedUser>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.2rem",
              width: "100%",
            }}
          >
            <TextField
              sx={{ width: "40%" }}
              select
              label="General Access"
              onChange={(e) => {
                if (e.target.value == "public") {
                  state.setIsPublic(true)
                  state.setIsDisabled(false)
                } else {
                  state.setIsDisabled(true)
                  state.setIsPublic(false)
                }
              }}
            >
              {generalAccess.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {state.isPublic && (
              <TextField
                sx={{ width: "40%" }}
                select
                label="Permissions"
                fullWidth
              >
                {permissions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
          <Stack
            sx={{
              width: 1,
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.2rem",
            }}
          >
            <TextField
              sx={{ width: "60%" }}
              focused
              inputRef={inputRef}
              label="Share URL"
              value={getShareableUrl(file?.id || "")}
              variant="outlined"
              inputProps={{ autoComplete: "off" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyClick}>
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              disabled={shareMutation.isLoading}
              sx={{ fontWeight: "normal" }}
              variant="contained"
              onClick={() => shareMutation.mutate(sharePayload)}
              disableElevation
            >
              {state.currentSharedUsers.length > 0 ? "Update" : "Create"}
            </Button>
          </Stack>
        </StyledPaper>
      </Fade>
    </Modal>
  )
})
