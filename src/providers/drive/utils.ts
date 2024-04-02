import { DriveSession } from "@/types"

export interface DefaultSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
}

export const mediaUrl = (id: string, name: string, download = false) => {
  const host = window.location.origin
  const mediaPath = `${id}/${encodeURIComponent(name)}${download ? "?d=1" : ""}`
  return `${host}/api/files/stream/${mediaPath}`
}

export const profileUrl = (session: DriveSession) => session.user?.image || ""

export const profileName = (session: DriveSession) => session.user?.name || ""
