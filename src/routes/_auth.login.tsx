import { createFileRoute } from "@tanstack/react-router"

import { Login } from "@/components/Login"

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => search as { redirect?: string },
  component: Login,
})
