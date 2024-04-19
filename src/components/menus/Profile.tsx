import { signOut } from "@hono/auth-js/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
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
import { sessionQueryOptions } from "@/utils/queryOptions"

export function ProfileDropDown() {
  const { data: session } = useQuery(sessionQueryOptions)

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
        className="rounded-lg shadow-1"
        itemClasses={{
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
          as={Link}
          //@ts-ignore
          to="/settings/$tabId"
          params={{ tabId: "general" }}
          endContent={<IconOutlineSettings className="size-6" />}
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          endContent={<IconBaselineLogout className="size-6" />}
          onPress={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
