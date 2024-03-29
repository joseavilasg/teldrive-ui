import { FC, memo, useEffect, useRef } from "react"
import type Artplayer from "artplayer"
import type ArtOption from "artplayer/types/option"
import { AspectRatio } from "artplayer/types/player"

import Player from "./ArtPlayer"

const aspectRatioes = ["default", "4:3", "16:9"]

interface VideoPlayerProps {
  videoName: string
  videoUrl: string
}
const VideoPlayer = ({ videoName, videoUrl }: VideoPlayerProps) => {
  const artInstance = useRef<Artplayer | null>(null)

  const artOptions: ArtOption = {
    container: "",
    title: videoName,
    volume: 0.6,
    muted: false,
    autoplay: true,
    pip: true,
    autoSize: false,
    autoHeight: true,
    autoMini: true,
    screenshot: true,
    setting: true,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    fullscreen: true,
    fullscreenWeb: true,
    mutex: true,
    backdrop: true,
    hotkey: true,
    playsInline: true,
    autoPlayback: true,
    airplay: true,
    lock: true,
    fastForward: true,
    autoOrientation: true,
    moreVideoAttr: {
      // @ts-ignore
      "webkit-playsinline": true,
      crossOrigin: "use-credentials",
      playsInline: true,
    },
  }

  useEffect(() => {
    if (artInstance.current && videoUrl) {
      artInstance.current.switchUrl(videoUrl)
      artInstance.current.title = videoName
    }
    return () => {
      if (artInstance.current) {
        artInstance.current.video.pause()
        artInstance.current.video.removeAttribute("src")
        artInstance.current.video.load()
      }
    }
  }, [videoName, videoUrl])

  return (
    <Player
      option={artOptions}
      style={{ aspectRatio: "16 /9" }}
      getInstance={(art) => {
        artInstance.current = art
        art.hotkey.add(65, (_: Event) => {
          art.aspectRatio = aspectRatioes[
            (aspectRatioes.findIndex((val) => val === art.aspectRatio) + 1) %
              aspectRatioes.length
          ] as AspectRatio
        })
      }}
    />
  )
}

interface VideoPreviewProps {
  name: string
  assetUrl: string
}
const VideoPreview = ({ name, assetUrl }: VideoPreviewProps) => {
  return <VideoPlayer videoName={name} videoUrl={assetUrl} />
}
export default memo(VideoPreview)
