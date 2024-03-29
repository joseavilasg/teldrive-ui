import { Outlet } from "@tanstack/react-router"

export const NonAuthLayout = () => {
  return (
    <div className="grid grid-areas-[header,main] grid-rows-[4rem_1fr] min-h-dvh">
      <header className="area-[header]"></header>
      <main className="area-[main] container">
        <Outlet />
      </main>
    </div>
  )
}
