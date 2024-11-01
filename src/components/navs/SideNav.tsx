import { memo, MouseEvent, SVGProps, useCallback } from "react"
import { Button } from "@tw-material/react"
import IconBasilGoogleDriveOutline from "~icons/basil/google-drive-outline"
import IconIcOutlineSdStorage from "~icons/ic/outline-sd-storage"
import IconMdiRecent from "~icons/mdi/recent"
import IconMdiStarOutline from "~icons/mdi/star-outline"
import clsx from "clsx"

import { ForwardLink } from "@/components/ForwardLink"
import { usePreload } from "@/utils/queryOptions"

export const categories = [
  { id: "my-drive", name: "My Drive", icon: IconBasilGoogleDriveOutline },
  { id: "starred", name: "Starred", icon: IconMdiStarOutline },
  { id: "recent", name: "Recent", icon: IconMdiRecent },
  { id: "storage", name: "Storage", icon: IconIcOutlineSdStorage },
] as const

interface SidNavItemProps extends ReturnType<typeof usePreload> {
  id: (typeof categories)[number]["id"]
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  name: string
}

const SidNavItem = memo(
  ({ id, icon: Icon, preloadFiles, preloadStorage, name }: SidNavItemProps) => {
    const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (id !== "storage") preloadFiles("", id)
      else preloadStorage()
    }, [])

    return (
      <div className="flex flex-col gap-1 w-16 items-center">
        <Button
          as={ForwardLink}
          to="/$"
          params={{ _splat: id }}
          variant="text"
          onClick={handleClick}
          isIconOnly
          className={clsx(
            "h-8 w-full max-w-16 rounded-3xl px-0 mx-auto",
            "text-on-surface-variant",
            "data-[status=active]:bg-secondary-container data-[status=active]:text-on-secondary-container",
            "[&>svg]:data-[status=active]:scale-110 [&>svg]:transition-transform"
          )}
        >
          <Icon className="size-6" />
        </Button>
        <p className="text-label-small text-on-surface">{name}</p>
      </div>
    )
  }
)

export const SideNav = memo(() => {
  const preload = usePreload()
  return (
    <aside className="w-full md:w-20 md:pt-20 pt-0 h-16 md:h-full">
      <ul
        className="size-full flex flex-row justify-evenly md:justify-normal md:flex-col 
        items-center list-none gap-4 overflow-hidden"
      >
        {categories.map((item) => (
          <SidNavItem key={item.id} {...item} {...preload} />
        ))}
      </ul>
    </aside>
  )
})
