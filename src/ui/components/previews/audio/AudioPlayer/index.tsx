import { FC } from "react"
import Box from "@mui/material/Box"
import useMediaQuery from "@mui/material/useMediaQuery"

import ArtistName from "./ArtistName"
import CoverArt from "./ConverArt"
import MediaControlButtons from "./MediaControlButtons"
import MediaFunctionButtons from "./MediaFunctionButtons"
import TimeScaleBar from "./TimeScaleBar"
import TrackTitle from "./TrackTitle"

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
      <Box width={1} px={2}>
        <TrackTitle title={trackTitle} />
        <ArtistName artist={artistName} />
        <TimeScaleBar />
        <MediaControlButtons />
        <MediaFunctionButtons />
      </Box>
    </Box>
  )
}

export default AudioPlayer
