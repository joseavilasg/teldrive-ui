import { Icon } from "@iconify/react"
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@tw-material/react"

import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <Dropdown
      classNames={{
        content: "min-w-36",
      }}
      showArrow
    >
      <DropdownTrigger>
        <Button className="text-inherit" variant="text" isIconOnly>
          <Icon
            icon="ph:sun"
            className="pointer-events-none size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon="ri:moon-clear-line"
            className="pointer-events-none absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onPress={() => setTheme("light")}>Light</DropdownItem>
        <DropdownItem onPress={() => setTheme("dark")}>Dark</DropdownItem>
        <DropdownItem onPress={() => setTheme("system")}>System</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
