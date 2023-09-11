import { FC, memo, useEffect } from "react"
import { Box, CircularProgress } from "@mui/material"
import { useAudioPlayer, useGlobalAudioPlayer } from "react-use-audio-player"

import AudioPlayer from "./AudioPlayer"

const AudioPreview: FC<{ name: string; mediaUrl: string }> = ({
  name,
  mediaUrl,
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
    <Box
      sx={{
        borderRadius: 2,
        backgroundColor: "white",
        maxWidth: "90%",
        width: "auto",
        m: "auto",
        py: 2,
        position: "relative",
        display: "grid",
        placeContent: "center",
      }}
    >
      <AudioPlayer
        imageUrl="https://cdns-images.dzcdn.net/images/cover/5004d4b0db08b9e1eb8f10601e6772ec/500x500.jpg"
        artistName="Against the Current"
        trackTitle={name}
      />
    </Box>
  )
}

export default memo(AudioPreview)
