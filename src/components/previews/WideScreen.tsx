import { memo } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@tw-material/react"
import { cn } from "@tw-material/theme"
import { useToggle } from "usehooks-ts"

interface WideScreenProps {
  children: React.ReactNode
}
export const WideScreen = memo(({ children }: WideScreenProps) => {
  const [fullscreen, toggle] = useToggle(false)
  return (
    <div className="max-w-[70%] w-full mx-auto p-4 relative h-[90vh]">
      <div
        className={cn(
          "size-full",
          fullscreen ? "fixed inset-0 z-50" : "relative"
        )}
      >
        <Button
          isIconOnly
          className="absolute bottom-2 right-5 z-[100]"
          variant="filled"
          onPress={toggle}
        >
          {fullscreen ? (
            <Icon
              className="pointer-events-none"
              icon="ic:round-fullscreen-exit"
            />
          ) : (
            <Icon className="pointer-events-none" icon="ic:round-fullscreen" />
          )}
        </Button>
        {children}
      </div>
    </div>
  )
})
