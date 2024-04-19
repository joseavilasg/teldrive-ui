import { memo, useCallback } from "react"
import { getRouteApi } from "@tanstack/react-router"

import { ApperanceTab } from "./ApperanceTab"
import { GeneralTab } from "./GeneralTab"

const fileRoute = getRouteApi("/_authenticated/settings/$tabId")

export const SettingsTabView = memo(() => {
  const params = fileRoute.useParams()
  const renderTab = useCallback(() => {
    switch (params.tabId) {
      case "appearance":
        return <ApperanceTab />

      default:
        return <GeneralTab />
    }
  }, [params.tabId])

  return <>{renderTab()}</>
})
