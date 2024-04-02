import { memo, useCallback, useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import { Button, Slider } from "@tw-material/react"
import { useEventListener, useInterval } from "usehooks-ts"
import { useShallow } from "zustand/react/shallow"

import { formatDuration } from "@/utils/common"
import { audioActions, useAudioStore } from "@/utils/store"

interface PlayerProps {
  nextItem: (previewType: string) => void
  prevItem: (previewType: string) => void
}

type SliderValue = number | number[]

const getVolumeIcon = (volume: number, muted: boolean) => {
  if (volume === 0 || muted) return "lucide:volume-x"
  if (volume < 0.5) return "lucide:volume-1"
  return "lucide:volume-2"
}
const AudioCover = memo(() => {
  const metadata = useAudioStore((state) => state.metadata)
  return (
    <div className="relative col-span-6 md:col-span-5">
      <img
        alt="Album cover"
        className="object-cover rounded-large"
        height={200}
        src={metadata.cover}
        width="100%"
      />
    </div>
  )
})

const AudioInfo = memo(() => {
  const metadata = useAudioStore((state) => state.metadata)
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-0 min-w-0">
        <h3
          title={metadata.title}
          className="text-small font-semibold truncate"
        >
          {metadata.title}
        </h3>
        <h1
          title={metadata.artist}
          className="text-large font-medium mt-2 truncate"
        >
          {metadata.artist}
        </h1>
      </div>
    </div>
  )
})

const AudioDurationSlider = memo(() => {
  const { audio, duration, seekPosition, actions, delay } = useAudioStore(
    useShallow((state) => ({
      audio: state.audio,
      duration: state.duration,
      seekPosition: state.seekPosition,
      actions: state.actions,
      delay: state.delay,
    }))
  )

  const sliderRef = useRef<HTMLDivElement>(null)

  const onPositionChangeEnd = useCallback(
    (value: SliderValue) => actions.seek(value as number),
    []
  )

  const onPositionChange = useCallback(
    (value: SliderValue) => actions.setSeekPosition(value as number),
    []
  )

  useInterval(() => {
    if (sliderRef.current && delay > 0) {
      const isDragging = (
        sliderRef?.current.firstElementChild?.firstElementChild
          ?.lastElementChild as HTMLDivElement
      ).dataset?.dragging
      if (isDragging !== "true") {
        actions.setSeekPosition(Math.floor(audio?.currentTime!))
      }
    }
  }, delay)

  return (
    <>
      <Slider
        ref={sliderRef}
        size="sm"
        aria-label="progress"
        value={seekPosition}
        maxValue={duration}
        minValue={0}
        step={1}
        disableThumbScale
        onChangeEnd={onPositionChangeEnd}
        onChange={onPositionChange}
        classNames={{
          thumb: "size-3 after:size-3  after:bg-primary",
          track:
            "data-[thumb-hidden=false]:border-x-[calc(theme(spacing.3)/2)]",
        }}
      />
      <div className="flex justify-between">
        <p className="text-small">{formatDuration(seekPosition)}</p>
        <p className="text-small ">{formatDuration(duration)}</p>
      </div>
    </>
  )
})

const VolumeSlider = memo(() => {
  const volume = useAudioStore((state) => state.volume)
  const actions = useAudioStore(audioActions)

  const onVolumeChange = useCallback(
    (value: SliderValue) => actions.setVolume(value as number),
    []
  )

  return (
    <Slider
      aria-label="Volume"
      size="sm"
      value={volume}
      maxValue={1}
      minValue={0}
      onChange={onVolumeChange}
      step={0.01}
      classNames={{
        base: "w-1/3",
        thumb: "size-3 after:size-3 after:bg-primary",
        track: "data-[thumb-hidden=false]:border-x-[calc(theme(spacing.3)/2)]",
      }}
    />
  )
})

interface TopControlsProps {
  nextItem: (previewType: string) => void
  prevItem: (previewType: string) => void
}

const TopControls = memo(({ nextItem, prevItem }: TopControlsProps) => {
  const { isPlaying, actions } = useAudioStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      actions: state.actions,
    }))
  )

  const handleNext = useCallback(() => {
    nextItem("audio")
    actions.set({ seekPosition: 0, delay: 0 })
  }, [nextItem])

  const handlePrev = useCallback(() => {
    prevItem("audio")
    actions.set({ seekPosition: 0, delay: 0 })
  }, [prevItem])

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={handlePrev}
      >
        <Icon icon="solar:skip-previous-bold" />
      </Button>
      <Button
        variant="text"
        className="text-inherit size-14"
        isIconOnly
        onPress={actions.togglePlay}
      >
        {isPlaying ? (
          <Icon className="!size-12" icon="ic:round-pause-circle" />
        ) : (
          <Icon className="!size-12" icon="ic:round-play-circle" />
        )}
      </Button>
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={handleNext}
      >
        <Icon icon="solar:skip-next-bold" />
      </Button>
    </div>
  )
})

const BottomControls = memo(() => {
  const actions = useAudioStore(audioActions)
  const { volume, muted, looping } = useAudioStore(
    useShallow((state) => ({
      volume: state.volume,
      muted: state.isMuted,
      looping: state.isLooping,
    }))
  )

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={actions.toggleLooping}
      >
        {looping ? (
          <Icon icon="ri:repeat-one-fill" />
        ) : (
          <Icon icon="ri:repeat-2-fill" />
        )}
      </Button>
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={actions.toggleMute}
      >
        <Icon icon={getVolumeIcon(volume, muted)} />
      </Button>
      <VolumeSlider />
    </div>
  )
})

export const AudioPlayer = memo(({ nextItem, prevItem }: PlayerProps) => {
  const audio = useRef(new Audio())

  const actions = useAudioStore(audioActions)

  const isEnded = useAudioStore((state) => state.isEnded)

  useEffect(() => {
    if (audio.current !== null) actions.setAudioRef(audio.current)
  }, [audio.current])

  useEventListener(
    "loadedmetadata",
    () => actions.setDuration(audio.current.duration),
    audio
  )

  useEventListener(
    "ended",
    () => {
      actions.set({ seekPosition: 0, delay: 0, isEnded: true })
    },
    audio
  )

  useEffect(() => {
    return () => {
      if (audio.current) {
        actions.reset()
        audio.current.pause()
        audio.current.src = ""
        audio.current.load()
      }
    }
  }, [])

  useEffect(() => {
    if (isEnded) nextItem("audio")
  }, [isEnded])

  return (
    <div
      className="flex flex-col relative overflow-hidden height-auto outline-none 
      bg-surface max-w-80 md:max-w-[39rem] rounded-large p-3 m-auto"
    >
      <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 justify-center text-xs text-on-surface">
        <AudioCover />
        <div className="flex flex-col col-span-6 md:col-span-7">
          <AudioInfo />
          <div className="flex flex-col mt-3 gap-1">
            <AudioDurationSlider />
            <TopControls nextItem={nextItem} prevItem={prevItem} />
            <BottomControls />
          </div>
        </div>
      </div>
    </div>
  )
})
