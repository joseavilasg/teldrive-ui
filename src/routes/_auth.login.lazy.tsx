import { Login } from "@/providers/drive/login"
import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_auth/login")({
  component: Login,
})
