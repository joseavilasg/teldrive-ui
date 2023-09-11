import { FC } from "react"
import { Box, Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

import CoverArt from "./ConverArt"
import MediaControlButtons from "./MediaControlButtons"
import MediaFunctionButtons from "./MediaFunctionButtons"
import TimeScaleBar from "./TimeScaleBar"

interface PlayerProps {
  imageUrl: string
  trackTitle: string
  artistName: string
}

const AudioPlayer: FC<PlayerProps> = ({ imageUrl, trackTitle, artistName }) => {
  const isM = useMediaQuery("(max-width:900px)")

  return (
    <Box
      width={1}
      height={1}
      display="flex"
      flexDirection={isM ? "column" : "row"}
      alignItems="center"
    >
      <CoverArt imageUrl={imageUrl} />
      <Box width={1} p={2}>
        <Typography
          variant="h5"
          component="h1"
          textAlign="center"
          mt={1}
          fontWeight={600}
        >
          {trackTitle}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          mb={1}
          textAlign="center"
          color="primary"
        >
          {artistName}
        </Typography>
        <TimeScaleBar />
        <MediaControlButtons />
        <MediaFunctionButtons />
      </Box>
    </Box>
  )
}

export default AudioPlayer
