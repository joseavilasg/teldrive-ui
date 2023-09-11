import { FC, useState } from "react"
import { Box, CircularProgress } from "@mui/material"
import { useMediaQuery } from "usehooks-ts"

interface CoverArtProps {
  imageUrl: string
}

const CoverArt: FC<CoverArtProps> = ({ imageUrl }) => {
  const isM = useMediaQuery("(max-width:900px)")
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  console.log({ isLoaded })
  const handleImageOnLoad = () => {
    setIsLoaded(true)
  }

  return (
    <Box
      sx={{
        minWidth: "350px",
        minHeight: "350px",
        maxWidth: isM ? "350px" : "500px",
        maxHeight: isM ? "350px" : "500px",
        width: 1,
        height: 1,
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
        // alt={name}
        sx={{
          width: 1,
          margin: "auto",
          borderRadius: 1,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 300ms ease-in 0ms",
        }}
      />
    </Box>
  )
}

export default CoverArt
