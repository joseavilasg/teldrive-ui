import { lazy, memo, Suspense } from "react"
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@tw-material/react"
import IconIcOutlineColorLens from "~icons/ic/outline-color-lens"

import { center } from "@/utils/classes"

const ColorPicker = lazy(() => import("./picker"))

export const ColorPickerMenu = memo(() => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button className="text-inherit" variant="text" isIconOnly>
          <IconIcOutlineColorLens className="pointer-events-none size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2 p-2.5 size-[220px] relative">
        <Suspense fallback={<Spinner className={center} />}>
          <ColorPicker />
        </Suspense>
      </PopoverContent>
    </Popover>
  )
})
