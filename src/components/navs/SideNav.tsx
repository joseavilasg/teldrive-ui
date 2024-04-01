import { Icon } from "@iconify/react"
import { Button } from "@tw-material/react"
import { cn } from "@tw-material/theme"

import { ForwardLink } from "@/components/ForwardLink"

export const categories = [
  { id: "my-drive", name: "My Drive", icon: "basil:google-drive-outline" },
  { id: "starred", name: "starred", icon: "mdi:star-outline" },
  { id: "recent", name: "recent", icon: "mdi:recent" },
  { id: "storage", name: "storage", icon: "ic:outline-sd-storage" },
] as const

export const SideNav = () => {
  return (
    <aside className="area-[nav]">
      <ul className="size-full flex-wrap flex flex-row md:flex-col items-center list-none gap-4 px-3 overflow-auto">
        {categories.map(({ id, icon }) => (
          <Button
            as={ForwardLink}
            variant="text"
            key={id}
            to="/$"
            isIconOnly
            params={{ _splat: id }}
            preload="intent"
            className={cn(
              "h-8 w-full max-w-14 rounded-3xl px-0 mx-auto",
              "text-on-surface-variant",
              "data-[status=active]:bg-secondary-container data-[status=active]:text-on-secondary-container",
              "[&>svg]:data-[status=active]:scale-110 [&>svg]:transition-transform"
            )}
          >
            <Icon
              className="size-6 text-inherit pointer-events-none"
              icon={icon}
            />
          </Button>
        ))}
      </ul>
    </aside>
  )
}
