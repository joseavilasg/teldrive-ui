import { ChangeEvent, memo, useCallback, useMemo, useState } from "react"
import provider from "@/providers"
import { Link, useRouterState } from "@tanstack/react-router"
import { Input } from "@tw-material/react"
import IconBiSearch from "~icons/bi/search"
import clsx from "clsx"
import debounce from "lodash.debounce"

import usePrevious from "@/hooks/usePrevious"
import { usePreloadFiles } from "@/utils/queryOptions"

import { ColorPicker } from "./menus/ColorPicker"
import { ProfileDropDown } from "./menus/Profile"
import { ThemeToggle } from "./menus/ThemeToggle"

const cleanSearchInput = (input: string) => input.trim().replace(/\s+/g, " ")

interface SearchBarProps {
  className?: string
}

const SearchBar = memo(({ className }: SearchBarProps) => {
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

  return (
    <Input
      variant="flat"
      placeholder="Search..."
      enterKeyHint="search"
      autoComplete="off"
      aria-label="search"
      onClear={() => setQuery("")}
      value={query}
      onChange={updateQuery}
      classNames={{
        base: clsx("min-w-[15rem] max-w-96", className),
        inputWrapper: "rounded-full group-data-[focus=true]:bg-surface",
        input: "px-2",
      }}
      startContent={<IconBiSearch className="size-6" />}
    ></Input>
  )
})

export default memo(function Header({ auth }: { auth: boolean }) {
  const [showSearch, setShowSearch] = useState(false)
  return (
    <header className="flex items-center area-[header] px-4">
      <div className="flex-1 flex gap-2 items-center">
        <Link to="/" className="flex gap-2 items-center cursor-pointer">
          <provider.headerIcon className="size-6 text-inherit" />
          <p className="text-headline-small hidden sm:block">
            {provider.heading}
          </p>
        </Link>
      </div>
      <div className="flex-1 flex justify-end items-center gap-4">
        {auth && <SearchBar className="hidden xs:block" />}
        <ColorPicker />
        <ThemeToggle />
        {auth && <ProfileDropDown />}
      </div>
    </header>
  )
})
