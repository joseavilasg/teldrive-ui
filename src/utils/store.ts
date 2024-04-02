import { Tags } from "@/types"
import type { FileData } from "@tw-material/file-browser"
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
  seekPosition: 0,
  delay: 0,
  metadata: {
    artist: "Unkown artist",
    title: "Unkown title",
    cover: "/images/cover.png",
  },
}

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
    setSeekPosition: (value: number) => void
    set: (payload: Partial<PlayerState>) => void
    reset: () => void
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
        set({
          ...state,
          isPlaying: true,
          isEnded: false,
          metadata,
          delay: 1000,
        })
      }
    },
    seek: (value) =>
      set((state) => {
        const audio = state.audio
        if (audio instanceof HTMLAudioElement) {
          audio.currentTime = value
          return { ...state, currentTime: value }
        }
        return state
      }),
    setSeekPosition: (value) => {
      set((state) => {
        return { ...state, seekPosition: value }
      })
    },
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
    setEnded: () => set((state) => ({ ...state, isEnded: true })),
    setAudioRef: (ref: AudioRef) => set({ audio: ref }),
    set: (payload) => set((state) => ({ ...state, ...payload })),
    reset: () => set(() => ({ ...defaultState })),
  },
}))

export const audioActions = (state: PlayerState) => state.actions

type ModalState = {
  open: boolean
  operation: string
  type: string
  currentFile: FileData
  selectedFiles?: string[]
  name?: string
  actions: {
    setOperation: (operation: string) => void
    setOpen: (open: boolean) => void
    setCurrentFile: (currentFile: FileData) => void
    setSelectedFiles: (selectedFiles: string[]) => void
    set: (payload: Partial<ModalState>) => void
  }
}

export const useModalStore = create<ModalState>((set) => ({
  open: false,
  operation: "",
  type: "",
  selectedFiles: [],
  name: "",
  currentFile: {} as FileData,
  actions: {
    setOperation: (operation: string) =>
      set((state) => ({ ...state, operation })),
    setOpen: (open: boolean) => set((state) => ({ ...state, open })),
    setCurrentFile: (currentFile: FileData) =>
      set((state) => ({ ...state, currentFile })),
    setSelectedFiles: (selectedFiles: string[]) =>
      set((state) => ({ ...state, selectedFiles })),
    set: (payload) => set((state) => ({ ...state, ...payload })),
  },
}))
