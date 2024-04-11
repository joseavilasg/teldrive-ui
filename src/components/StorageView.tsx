import { memo } from "react"

export const StorageView = memo(() => {
  return (
    <div className="h-full grid grid-rows-[max-content_1fr_1fr_1fr] md:grid-cols-[1fr_0.3fr] grid-cols-none md:grid-rows-3">
      <div className="border-2">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 p-4">
          <div className="h-20 bg-surface rounded-xl"></div>
          <div className="h-20 bg-surface rounded-xl"></div>
          <div className="h-20 bg-surface rounded-xl"></div>
          <div className="h-20 bg-surface rounded-xl"></div>
          <div className="h-20 bg-surface rounded-xl"></div>
        </div>
      </div>
      <div className=" min-h-40 border-2  border-slate-200"></div>
      <div className=" min-h-40 border-2  border-slate-300"></div>
      <div className="min-h-40 col-start-1 md:col-start-2 md:row-span-full border-2  border-slate-600"></div>
    </div>
  )
})
