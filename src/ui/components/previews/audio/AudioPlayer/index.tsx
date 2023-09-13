import { FC } from "react"
import { Box, Typography } from "@mui/material"
import Skeleton from "@mui/material/Skeleton"
import useMediaQuery from "@mui/material/useMediaQuery"

import { useGetAudioMetadata } from "@/ui/hooks/queryhooks"
import useSettings from "@/ui/hooks/useSettings"
import { getAudioCoverUrl } from "@/ui/utils/common"

import CoverArt from "./ConverArt"
import MediaControlButtons from "./MediaControlButtons"
import MediaFunctionButtons from "./MediaFunctionButtons"
import TimeScaleBar from "./TimeScaleBar"

interface PlayerProps {
  fileId: string
}

const AudioPlayer: FC<PlayerProps> = ({ fileId }) => {
  const isM = useMediaQuery("(max-width:900px)")
  const isSm = useMediaQuery("(max-width:500px)")

  const {
    data = { artist: "Unkown artist", title: "Unkown title" },
    isLoading,
  } = useGetAudioMetadata(fileId)
  const { settings } = useSettings()

  let coverUrl: string | undefined = undefined
  if (data?.cover) {
    coverUrl = getAudioCoverUrl(
      settings.apiUrl,
      fileId,
      `${data.cover.type}.${data.cover.extension}`
    )
  }

  return (
    <Box
      display="flex"
      flexDirection={isM ? "column" : "row"}
      alignItems="center"
      justifyContent="center"
    >
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width={isSm ? 250 : 350}
          height={isSm ? 250 : 350}
        />
      ) : (
        <>{coverUrl && <CoverArt imageUrl={coverUrl} />}</>
      )}

      <Box p={2} minWidth={isSm ? "250px" : "350px"}>
        <Typography
          variant="h5"
          component="h1"
          textAlign="center"
          mt={1}
          fontWeight={600}
        >
          {isLoading ? (
            <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
          ) : (
            data.title
          )}
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          mb={1}
          textAlign="center"
          color="primary"
        >
          {isLoading ? (
            <Skeleton variant="text" sx={{ fontSize: "1.25rem" }} />
          ) : (
            data.artist
          )}
        </Typography>
        <TimeScaleBar />
        <MediaControlButtons />
        <MediaFunctionButtons />
      </Box>
    </Box>
  )
}

export default AudioPlayer
