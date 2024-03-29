import { SortState } from "@/types"
import { useLocalStorage } from "usehooks-ts"

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
export const defaultSortState: SortState = {
  "my-drive": { sort: "name", order: SortOrder.ASC },
  search: { sort: "name", order: SortOrder.ASC },
  starred: { sort: "updatedAt", order: SortOrder.DESC },
  recent: { sort: "updatedAt", order: SortOrder.DESC },
}

export function useSortFilter() {
  const [sortFilter, setSortFilter] = useLocalStorage<SortState>(
    "sortFilter",
    defaultSortState
  )
  return { sortFilter, setSortFilter }
}
