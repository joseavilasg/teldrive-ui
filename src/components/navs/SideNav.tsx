import { memo } from "react"
import { Button } from "@tw-material/react"
import { cn } from "@tw-material/theme"
import IconBasilGoogleDriveOutline from "~icons/basil/google-drive-outline"
import IconIcOutlineSdStorage from "~icons/ic/outline-sd-storage"
import IconMdiRecent from "~icons/mdi/recent"
import IconMdiStarOutline from "~icons/mdi/star-outline"

import { ForwardLink } from "@/components/ForwardLink"
import { usePreloadFiles } from "@/utils/queryOptions"

export const categories = [
  { id: "my-drive", name: "My Drive", icon: IconBasilGoogleDriveOutline },
  { id: "starred", name: "Starred", icon: IconMdiStarOutline },
  { id: "recent", name: "Recent", icon: IconMdiRecent },
  { id: "storage", name: "Storage", icon: IconIcOutlineSdStorage },
] as const

export const SideNav = memo(() => {
  const preloadFiles = usePreloadFiles()
  return (
    <aside className="area-[nav]">
      <ul className="size-full flex-wrap flex flex-row md:flex-col items-center list-none gap-4 px-3 pt-0 md:pt-2 overflow-auto">
        {categories.map(({ id, icon: Icon }) => {
          const linkProps = {
            variant: "text",
            onClick:
              id !== "storage" ? (e: any) => e.preventDefault() : undefined,
            onPress:
              id !== "storage" ? () => preloadFiles("", id as any) : undefined,
            isIconOnly: true,
            className: cn(
              "h-8 w-full max-w-14 rounded-3xl px-0 mx-auto",
              "text-on-surface-variant",
              "data-[status=active]:bg-secondary-container data-[status=active]:text-on-secondary-container",
              "[&>svg]:data-[status=active]:scale-110 [&>svg]:transition-transform"
            ),
          } as const
          return (
            <Button
              as={ForwardLink}
              key={id}
              to="/$"
              params={{ _splat: id }}
              {...linkProps}
            >
              <Icon className="size-6 text-inherit pointer-events-none" />
            </Button>
          )
        })}
      </ul>
    </aside>
  )
})
