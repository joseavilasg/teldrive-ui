import { Icon } from "@iconify/react"
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@tw-material/react"

import { useSession } from "@/hooks/useSession"

export function ProfileSettings() {
  const { data: session } = useSession()
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
          className="outline-none"
          src={`/api/users/profile?photo=1&hash=${session?.hash}`}
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile" className="pointer-events-none">
          <p className="font-semibold">{session?.userName}</p>
        </DropdownItem>
        <DropdownItem
          key="settings"
          endContent={
            <Icon
              className="size-6 pointer-events-none"
              icon="ic:outline-settings"
            />
          }
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          endContent={
            <Icon
              className="size-6 pointer-events-none"
              icon="ic:baseline-logout"
            />
          }
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
