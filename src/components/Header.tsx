import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import provider from "@/providers"
import { Link, useRouterState } from "@tanstack/react-router"
import { Input } from "@tw-material/react"
import IconBiSearch from "~icons/bi/search"
import debounce from "lodash.debounce"

import usePrevious from "@/hooks/usePrevious"
import { usePreloadFiles } from "@/utils/queryOptions"

import { ColorPicker } from "./menus/ColorPicker"
import { ProfileDropDown } from "./menus/Profile"
import { ThemeToggle } from "./menus/ThemeToggle"

const cleanSearchInput = (input: string) => input.trim().replace(/\s+/g, " ")

const SearchBar = memo(() => {
  const [pathname] = useRouterState({ select: (s) => [s.location.pathname] })

  const [type, search] = useMemo(() => {
    const parts = pathname.split("/")
    return [parts[1], parts.length > 2 ? decodeURIComponent(parts[2]) : ""]
  }, [pathname])

  const prevType = usePrevious(type)

  const [query, setQuery] = useState("")

  const preloadFiles = usePreloadFiles()

  const debouncedSearch = useCallback(
    debounce(
      (newValue: string) => preloadFiles("/" + newValue, "search", false),
      1000
    ),
    []
  )

  const updateQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    const cleanInput = cleanSearchInput(event.target.value)
    if (cleanInput) {
      debouncedSearch(cleanInput)
    }
  }, [])

  useEffect(() => {
    if (prevType == "search" && type != prevType) setQuery("")
    else if (type == "search" && search) setQuery(search)
  }, [type, prevType, search])

  return (
    <Input
      variant="flat"
      placeholder="Search..."
      enterKeyHint="search"
      autoComplete="off"
      isClearable
      aria-label="search"
      onClear={() => setQuery("")}
      value={query}
      onChange={updateQuery}
      classNames={{
        base: "min-w-[15rem] max-w-96",
        inputWrapper: "rounded-full group-data-[focus=true]:bg-surface",
        input: "px-2",
      }}
      startContent={<IconBiSearch className="size-6" />}
    ></Input>
  )
})

export default memo(function Header({ auth }: { auth: boolean }) {
  return (
    <header className="flex items-center area-[header] px-4">
      <div className="flex-1 flex gap-2 items-center">
        <Link to="/" className="flex gap-2 items-center cursor-pointer">
          <provider.headerIcon className="size-6 text-inherit" />
          <p className="text-headline-small">{provider.heading}</p>
        </Link>
      </div>
      <div className="flex-1 flex justify-end items-center gap-4">
        {auth && <SearchBar />}
        <ColorPicker />
        <ThemeToggle />
        {auth && <ProfileDropDown />}
      </div>
    </header>
  )
})
