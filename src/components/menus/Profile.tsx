import provider from "@/providers"
import { Icon } from "@iconify/react"
import { useQuery } from "@tanstack/react-query"
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@tw-material/react"

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
          src={provider.profileUrl(session!)}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Menu"
        className="bg-surface-container-low"
        itemClasses={{
          base: "bg-surface-container-low",
          title: "text-medium",
          startIcon: "text-on-surface",
          endIcon: "text-on-surface",
        }}
      >
        <DropdownItem key="profile" className="pointer-events-none">
          <p className="font-semibold">{provider.profileName(session)}</p>
        </DropdownItem>
        <DropdownItem
          key="settings"
          endIcon={<Icon className="size-6" icon="ic:outline-settings" />}
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          endIcon={<Icon className="size-6" icon="ic:baseline-logout" />}
          onPress={() => provider.signOut({ callbackUrl: "/login" })}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
