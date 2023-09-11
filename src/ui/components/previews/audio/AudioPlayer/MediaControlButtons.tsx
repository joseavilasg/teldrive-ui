import { FC, useState } from "react"
import FastForwardIcon from "@mui/icons-material/FastForward"
import FastRewindIcon from "@mui/icons-material/FastRewind"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious"
import { Box, IconButton, Stack } from "@mui/material"
import { useGlobalAudioPlayer } from "react-use-audio-player"

const MediaControlButtons = () => {
  const { togglePlayPause, playing } = useGlobalAudioPlayer()

  return (
    <Box>
      <Stack
        spacing={2}
        direction="row"
        sx={{ mb: 1 }}
        alignItems="center"
        justifyContent="space-evenly"
      >
        {/* <IconButton sx={{ fontSize: 40 }}>
          <FastRewindIcon fontSize="inherit" />
        </IconButton> */}
        <IconButton sx={{ fontSize: 55 }} onClick={() => togglePlayPause()}>
          {playing ? (
            <PauseIcon fontSize="inherit" />
          ) : (
            <PlayArrowIcon fontSize="inherit" />
          )}
        </IconButton>
        {/* <IconButton sx={{ fontSize: 40 }}>
          <FastForwardIcon fontSize="inherit" />
        </IconButton> */}
      </Stack>
    </Box>
  )
}

export default MediaControlButtons
