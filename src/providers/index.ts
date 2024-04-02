import IconLucideGithub from "~icons/lucide/github"

import {
  Login,
  mediaUrl,
  profileName,
  profileUrl,
  signIn,
  signOut,
} from "./drive"

type Providers = keyof typeof providers

const providers = {
  drive: {
    LoginComponent: Login,
    mediaUrl,
    profileUrl,
    signIn,
    signOut,
    profileName,
    heading: import.meta.env.VITE_DRIVE_TITLE || "Drive",
    headerIcon: IconLucideGithub,
  },
}

export default providers[import.meta.env.VITE_DRIVE_PROVIDER as Providers]
