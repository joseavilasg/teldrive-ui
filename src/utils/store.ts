import { Tags } from "@/types"
import { create } from "zustand"

import parseAudioMetadata from "./tagparser"

type AudioRef = HTMLAudioElement | null

const defaultState = {
  audio: null as AudioRef,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLooping: false,
  isMuted: false,
  volume: 1,
  isEnded: false,
  metadata: {
    artist: "Unkown artist",
    title: "Unkown title",
    cover: "/images/cover.png",
  },
}

type AudioMetadata = typeof defaultState.metadata

type PlayerState = typeof defaultState & {
  actions: {
    seek: (value: number) => void
    setVolume: (value: number) => void
    togglePlay: () => void
    toggleMute: () => void
    toggleLooping: () => void
    setDuration: (value: number) => void
    setEnded: () => void
    setAudioRef: (ref: AudioRef) => void
    loadAudio: (url: string, name: string) => void
    setMetadata: (metadata: AudioMetadata) => void
  }
}

export const useAudioStore = create<PlayerState>((set, get) => ({
  ...defaultState,
  actions: {
    loadAudio: async (url, name) => {
      const state = get()
      const audio = state.audio
      if (audio instanceof HTMLAudioElement) {
        const tags = await parseAudioMetadata(url)
        let { artist, title, picture } = tags as Tags
        let cover = defaultState.metadata.cover
        if (picture) cover = URL.createObjectURL(picture as unknown as Blob)
        const metadata = {
          artist: artist || defaultState.metadata.artist,
          title: title || name,
          cover,
        }
        audio.src = url
        audio.autoplay = true
        audio.load()
        audio.play()
        set({ ...state, isPlaying: true, isEnded: false, metadata })
      }
    },
    setMetadata: (metadata) => set((state) => ({ ...state, metadata })),
    seek: (value) =>
      set((state) => {
        const audio = state.audio
        if (audio instanceof HTMLAudioElement) {
          audio.currentTime = value
          return { ...state, currentTime: value }
        }
        return state
      }),
    setVolume: (value) =>
      set((state) => {
        const audio = state.audio
        if (audio instanceof HTMLAudioElement) {
          audio.volume = value
          return { ...state, volume: value }
        }
        return state
      }),
    togglePlay: () =>
      set((state) => {
        const { audio, isPlaying } = state
        const shouldPlay = !isPlaying
        if (audio instanceof HTMLAudioElement) {
          shouldPlay ? audio.play() : audio.pause()
          return { ...state, isPlaying: shouldPlay }
        }
        return state
      }),
    toggleMute: () =>
      set((state) => {
        const audio = state.audio
        if (audio instanceof HTMLAudioElement) {
          audio.muted = !audio.muted
          return { ...state, isMuted: audio.muted }
        }
        return state
      }),
    toggleLooping: () =>
      set((state) => {
        const audio = state.audio
        if (audio instanceof HTMLAudioElement) {
          audio.loop = !audio.loop
          return { ...state, isLooping: audio.loop }
        }
        return state
      }),
    setDuration: (value) => set((state) => ({ ...state, duration: value })),
    setEnded: () => set((state) => ({ ...state, ended: true })),
    setAudioRef: (ref: AudioRef) => set({ audio: ref }),
  },
}))

export const audioActions = (state: PlayerState) => state.actions
