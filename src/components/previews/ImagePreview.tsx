import { memo, useState } from "react"
import { cn } from "@tw-material/theme"
import IconSvgSpinnerTadpole from "~icons/svg-spinners/tadpole"

interface ImagePreviewProps {
  name: string
  assetUrl: string
}

const ImagePreview = ({ name, assetUrl }: ImagePreviewProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const handleImageOnLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div className="max-w-[64rem] m-auto relative">
      {!isLoaded && (
        <IconSvgSpinnerTadpole className="size-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      )}

      <img
        onLoad={handleImageOnLoad}
        className={cn(
          "opacity-0 max-h-[calc(100vh-4rem)] pt-8 mx-auto object-contain transition-opacity duration-300 ease-in-out",
          isLoaded && "opacity-100"
        )}
        src={assetUrl}
        alt={name}
      />
    </div>
  )
}

export default memo(ImagePreview)
