import { FC, useState } from "react"
import { Box, CircularProgress } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

const CoverArt: FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const isSm = useMediaQuery("(max-width:500px)")
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const handleImageOnLoad = () => {
    setIsLoaded(true)
  }

  const imageSize = isSm ? "250px" : "350px"

  return (
    <Box
      sx={{
        minWidth: imageSize,
        minHeight: imageSize,
        maxWidth: imageSize,
        maxHeight: imageSize,
        p: 2,
        position: "relative",
      }}
    >
      {!isLoaded && (
        <CircularProgress
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      <Box
        onLoad={handleImageOnLoad}
        component={"img"}
        src={imageUrl}
        alt="cover"
        sx={{
          width: 1,
          margin: "auto",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 300ms ease-in 0ms",
        }}
      />
    </Box>
  )
}

export default CoverArt
