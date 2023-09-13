import { FC, memo, useEffect } from "react"
import { CircularProgress, Paper } from "@mui/material"
import { useGlobalAudioPlayer } from "react-use-audio-player"

import { useGetSongMetadata } from "@/ui/hooks/queryhooks"
import useSettings from "@/ui/hooks/useSettings"
import { getSongCoverUrl } from "@/ui/utils/common"

import AudioPlayer from "./AudioPlayer"

const AudioPreview: FC<{ mediaUrl: string; fileId: string }> = ({
  mediaUrl,
  fileId,
}) => {
  const player = useGlobalAudioPlayer()
  const { settings } = useSettings()

  const { data, isLoading } = useGetSongMetadata(fileId)

  useEffect(() => {
    if (data) {
      player.load(mediaUrl, {
        html5: true,
        autoplay: true,
        initialVolume: 0.6,
      })
    }
  }, [data])

  let coverUrl: string | undefined = undefined
  if (data?.cover) {
    coverUrl = getSongCoverUrl(
      settings.apiUrl,
      fileId,
      `${data.cover.type}.${data.cover.extension}`
    )
  }

  if (!player.isReady || isLoading || !data) {
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
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: 2,
        width: "auto",
      }}
      elevation={10}
    >
      <AudioPlayer
        imageUrl={coverUrl}
        artistName={data.artist}
        trackTitle={data.title}
      />
    </Paper>
  )
}

export default memo(AudioPreview)
