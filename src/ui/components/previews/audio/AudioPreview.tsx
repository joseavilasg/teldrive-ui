import { FC, memo, useEffect } from "react"
import { CircularProgress, Paper } from "@mui/material"
import { useGlobalAudioPlayer } from "react-use-audio-player"

import AudioPlayer from "./AudioPlayer"

const AudioPreview: FC<{ mediaUrl: string; fileId: string }> = ({
  mediaUrl,
  fileId,
}) => {
  const player = useGlobalAudioPlayer()

  useEffect(() => {
    player.load(mediaUrl, {
      html5: true,
      autoplay: true,
      initialVolume: 0.6,
    })
  }, [])

  if (!player.isReady) {
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
      <AudioPlayer fileId={fileId} />
    </Paper>
  )
}

export default memo(AudioPreview)
