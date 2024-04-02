import { Login, mediaUrl, profileUrl, signIn, signOut } from "./drive"

type Providers = keyof typeof providers

const providers = {
  drive: {
    LoginComponent: Login,
    mediaUrl,
    profileUrl,
    signIn,
    signOut,
    heading: import.meta.env.VITE_DRIVE_TITLE || "Drive",
    headerIcon: "lucide:github",
  },
}

export default providers[import.meta.env.VITE_DRIVE_PROVIDER as Providers]
