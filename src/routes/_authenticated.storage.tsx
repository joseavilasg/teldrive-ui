import { createFileRoute } from "@tanstack/react-router"

import { StorageView } from "@/components/StorageView"

export const Route = createFileRoute("/_authenticated/storage")({
  component: StorageView,
})
