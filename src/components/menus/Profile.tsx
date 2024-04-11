import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@tw-material/react"
import IconBaselineLogout from "~icons/ic/baseline-logout"
import IconOutlineSettings from "~icons/ic/outline-settings"

import { profileName, profileUrl } from "@/utils/common"
import http from "@/utils/http"
import { sessionQueryOptions } from "@/utils/queryOptions"

export function ProfileDropDown() {
  const { data: session, refetch } = useQuery(sessionQueryOptions)
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const signOut = useCallback(async () => {
    const res = await http.post("/api/auth/logout")
    refetch()
    if (res.status === 200) {
      queryClient.removeQueries()
      navigate({ to: "/login", replace: true })
    }
  }, [])

  return (
    <Dropdown
      classNames={{
        content: "min-w-36",
      }}
    >
      <DropdownTrigger>
        <Avatar
          as="button"
          size="sm"
          className="outline-none shrink-0"
          src={profileUrl(session!)}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Menu"
        className="bg-surface-container-low"
        itemClasses={{
          base: "bg-surface-container-low",
          title: "text-medium",
          startContent: "text-on-surface",
          endContent: "text-on-surface",
        }}
      >
        <DropdownItem key="profile" className="pointer-events-none">
          <p className="font-semibold">{profileName(session!)}</p>
        </DropdownItem>
        <DropdownItem
          key="settings"
          endContent={<IconOutlineSettings className="size-6" />}
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          endContent={<IconBaselineLogout className="size-6" />}
          onPress={signOut}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
