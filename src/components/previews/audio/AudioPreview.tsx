import { memo, useEffect } from "react"

import { audioActions, useAudioStore } from "@/utils/stores/audio"

import { AudioPlayer } from "./AudioPlayer"

interface AudioPreviewProps {
  nextItem: (previewType: string) => void
  prevItem: (previewType: string) => void
  assetUrl: string
  name: string
}

const unloadAudio = (audio: HTMLAudioElement) => {
  audio.pause()
  audio.src = ""
  audio.load()
  audio.remove()
}

const AudioPreview = ({
  assetUrl,
  name,
  nextItem,
  prevItem,
}: AudioPreviewProps) => {
  const actions = useAudioStore(audioActions)

  const audio = useAudioStore((state) => state.audio)

  useEffect(() => {
    if (audio) {
      audio.addEventListener("ended", () => actions.set({ isEnded: true }))
      audio.addEventListener("loadedmetadata", () =>
        actions.setDuration(audio.duration)
      )
      audio.addEventListener("play", () => actions.set({ isPlaying: true }))

      audio.addEventListener("pause", () => actions.set({ isPlaying: false }))
    }
    return () => {
      if (audio) {
        unloadAudio(audio)
        actions.reset()
      }
    }
  }, [audio])

  useEffect(() => {
    if (assetUrl) actions.loadAudio(assetUrl, name)
  }, [assetUrl, audio])

  return <AudioPlayer nextItem={nextItem} prevItem={prevItem} />
}

export default memo(AudioPreview)
