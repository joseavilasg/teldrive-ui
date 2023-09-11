import { useState } from "react"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd"
import RepeatIcon from "@mui/icons-material/Repeat"
import RepeatOneIcon from "@mui/icons-material/RepeatOne"
import ShareIcon from "@mui/icons-material/Share"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import VolumeDownIcon from "@mui/icons-material/VolumeDown"
import VolumeOffIcon from "@mui/icons-material/VolumeOff"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { Box, IconButton, Slider, Stack, Typography } from "@mui/material"
import { useGlobalAudioPlayer } from "react-use-audio-player"

const MediaFunctionButtons = () => {
  const { mute, muted, loop, looping, volume, setVolume } =
    useGlobalAudioPlayer()

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number)
  }

  return (
    <Box>
      <Stack
        spacing={0}
        direction="row"
        sx={{ mb: 1 }}
        alignItems="center"
        justifyContent="flex-start"
      >
        <IconButton onClick={() => loop(!looping)}>
          {looping ? <RepeatOneIcon color="primary" /> : <RepeatIcon />}
        </IconButton>
        {/* <IconButton onClick={() => setShuffle(!shuffle)}>
					{shuffle ? (
						<ShuffleIcon color="primary" />
					) : (
						<ShuffleIcon />
					)}
				</IconButton> */}
        {/* <IconButton onClick={() => setFavorite(!favorite)}>
          {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton> */}
        {/* <IconButton>
					<PlaylistAddIcon />
				</IconButton> */}
        {/* <IconButton>
          <ShareIcon />
        </IconButton> */}
        <Box width={1} ml={2}>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <IconButton onClick={() => mute(!muted)}>
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              size="small"
              aria-label="Volume"
              min={0}
              step={0.01}
              max={1}
              value={volume}
              onChange={handleVolumeChange}
            />
            <Box>
              <Typography width={40} display="block">
                {Math.floor(volume * 100)}%
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default MediaFunctionButtons
