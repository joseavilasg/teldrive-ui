import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Icon } from "@iconify/react"
import { Link, useRouterState } from "@tanstack/react-router"
import { Avatar, Button } from "@tw-material/react"
import debounce from "lodash.debounce"

import usePrevious from "@/hooks/usePrevious"
import { useSession } from "@/hooks/useSession"
import AccountMenu from "@/components/menus/Account"
import { usePreloadFiles } from "@/utils/queryOptions"

import { ProfileSettings } from "./ProfileSettings"
import { ThemeToggle } from "./ThemeToggle"

// const SearchBar = () => {
//   const { location } = useRouterState()

//   const [type, search] = useMemo(() => {
//     const parts = location.pathname.split("/")
//     return [parts[1], parts.length > 2 ? decodeURIComponent(parts[2]) : ""]
//   }, [location.pathname])

//   const prevType = usePrevious(type)

//   const [query, setQuery] = useState("")

//   const preloadFiles = usePreloadFiles()

//   const debouncedSearch = useCallback(
//     debounce(
//       (newValue: string) => preloadFiles("/" + newValue, "search", false),
//       1000
//     ),
//     []
//   )

//   const updateQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
//     setQuery(event.target.value)
//     const cleanInput = cleanSearchInput(event.target.value)
//     if (cleanInput) {
//       debouncedSearch(cleanInput)
//     }
//   }, [])

//   useEffect(() => {
//     if (prevType == "search" && type != prevType) setQuery("")
//     else if (type == "search" && search) setQuery(search)
//   }, [type, prevType, search])

//   return (
//     <Box className={classes.search}>
//       <Box className={classes.searchIcon}>
//         <SearchIcon />
//       </Box>
//       <InputBase
//         placeholder="Search Drive...."
//         classes={{
//           root: classes.inputRoot,
//           input: classes.inputInput,
//         }}
//         value={query}
//         inputProps={{
//           "aria-label": "search",
//           enterKeyHint: "search",
//           autoComplete: "off",
//         }}
//         onChange={updateQuery}
//       />
//       <Box className={classes.searchIcon}>
//         <IconButton
//           style={{ height: "35px", width: "35px" }}
//           onClick={() => setQuery("")}
//           size="large"
//         >
//           <CancelIcon />
//         </IconButton>
//       </Box>
//     </Box>
//   )
// }

export default function Header({ auth }: { auth: boolean }) {
  return (
    <header className="flex items-center area-[header] px-4">
      <Link to="/" className="flex-1 flex gap-2 items-center cursor-pointer">
        <Icon className="size-6 text-inherit " icon="ph:telegram-logo-fill" />
        <p className="text-headline-small">TelDrive</p>
      </Link>
      <div className="flex-1 flex justify-end items-center gap-4">
        <ThemeToggle />
        {auth && <ProfileSettings />}
      </div>
    </header>
  )
}
