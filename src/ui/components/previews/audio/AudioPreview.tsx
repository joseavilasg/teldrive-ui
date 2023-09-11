import { FC, memo, useEffect } from "react"
import { CircularProgress, Paper } from "@mui/material"
import { useGlobalAudioPlayer } from "react-use-audio-player"

import { useGetSongMetadata } from "@/ui/hooks/queryhooks"
import useSettings from "@/ui/hooks/useSettings"
import { getSongCoverUrl } from "@/ui/utils/common"

import AudioPlayer from "./AudioPlayer"

const AudioPreview: FC<{ name: string; mediaUrl: string; fileId: string }> = ({
  name,
  mediaUrl,
  fileId,
}) => {
  const player = useGlobalAudioPlayer()
  const { settings } = useSettings()

  const { data, isLoading } = useGetSongMetadata(fileId)
  const coverUrl = getSongCoverUrl(
    settings.apiUrl,
    fileId,
    `${data?.cover.type}.${data?.cover.extension}`
  )

  useEffect(() => {
    if (data) {
      player.load(mediaUrl, {
        html5: true,
        autoplay: true,
        initialVolume: 0.6,
      })
    }
  }, [data])

  if (!player.isReady || isLoading) {
    return (
      <CircularProgress
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    )
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        maxWidth: "90%",
        width: "auto",
        m: "auto",
        position: "relative",
        display: "grid",
        placeContent: "center",
      }}
      elevation={10}
    >
      <AudioPlayer
        imageUrl={coverUrl}
        artistName={data?.artist || ""}
        trackTitle={data?.title || ""}
      />
    </Paper>
  )
}

export default memo(AudioPreview)
