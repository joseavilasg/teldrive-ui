import { Tags } from "@/types"
import { create } from "zustand"

import parseAudioMetadata from "../tagparser"

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
    cover:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAcFBQYFBAcGBQYIBwcIChELCgkJChUPEAwRGBUaGRgVGBcbHichGx0lHRcYIi4iJSgpKywrGiAvMy8qMicqKyr/wAALCAEAAQABAREA/8QAGwABAAMBAQEBAAAAAAAAAAAAAAQGBwUBAgP/xAAxEAEAAgECAwYEBQUBAAAAAAAAAQIDBAUREiEGNUFRc7ETMWGyFSJxgZEUMkKhwdH/2gAIAQEAAD8AvoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACRt1K5dz02PJWLVtlrExPjHFcd22HS22vP/R6XHTNEc1ZrHXp4KMAAAAAAAAACVtfe+k9avu0pVO0HZy3NfWaCnGJ65MUe8KsAAAAAAAAAJW1976T1q+7SkPR7rpdbnzYMOThmw2mtsduk9J4cY84cbtH2frkx31uipy5K9clIj+6POPqqAAAAAAAAACVtfe+k9avu0pmutyXw71qcuK80vTUXmtqzwmPzSu+xbp+K7fz5IiM1J5ckR8p+v7qRueCum3XU4adK0yTEfoigAAAAAAAAlbX3vpPWr7tKZnuPeur9e/3S7/YqLfF1c/48tf56uDuWeNTuurzUnjW+a3LPnETw/4jAAAAAAAAAlbX3vpPWr7tKZnuPeur9e/3S7Gl12HZuy2S+PNSdZq5mMdK24zHhxmPpHGVerWK1isfKI4PQAAAAAAABMw7RuGorzYtJltXz5eHukaPa9dpd10ttRpclKxmr+aa9Pn5tAZnuPeur9e/3Si8tebm5Y5vPh1fQAAAAAAABWs2tFaxxmZ4REeK87J2ew6DDXNqaRk1Mxxnj1in0h2wZlrrc25au0fKc9/ul+AAAAAAAAAn7HFJ3zS/F4cvxI+fn4f7aKDn71u2LaNvtmvMTlt+XFj8b2/882dRzcON542nrM+c+L0AAAAAAAAe1tNLRaszFonjEx4LXt3bHD8KMe6VtS8dPi0rzVn9YjrDoz2q2Wteb8Qxz9IiZn+ODma7tviis12vTXzX8MmWOSkft85VjUajUa3UzqdbmnNmnpxnpFY8qx4Q+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/9k=",
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
