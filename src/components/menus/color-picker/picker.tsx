import { memo, useEffect, useState } from "react"
import { genThemeConfig } from "@tw-material/theme/config"
import { HexColorPicker } from "react-colorful"

import { useIsFirstRender } from "@/hooks/useFirstRender"
import { useTheme } from "@/components/ThemeProvider"

const ColorPicker = memo(() => {
  const { colorScheme, setColorScheme } = useTheme()

  const [color, setColor] = useState(colorScheme.color)

  const firstRender = useIsFirstRender()

  useEffect(() => {
    if (color == colorScheme.color || firstRender) {
      return
    }

    const config = genThemeConfig({
      sourceColor: color,
      customColors: [],
    })
    const cssVars = {}
    const sheet = new CSSStyleSheet()
    for (const key in config.utilities) {
      const value = Object.entries(config.utilities[key]).reduce(
        (acc, val) => `${acc}${val[0]}:${val[1]};`,
        ""
      )
      cssVars[key] = value
    }

    for (const key in cssVars) sheet.insertRule(`${key}{${cssVars[key]}}`)
    setColorScheme({ cssVars, color })

    document.adoptedStyleSheets = [sheet]
  }, [color, firstRender])

  return <HexColorPicker color={color} onChange={setColor} />
})

export default ColorPicker
