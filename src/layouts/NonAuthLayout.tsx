import { Outlet } from "@tanstack/react-router"

import Header from "@/components/Header"

export const NonAuthLayout = () => {
  return (
    <div className="grid grid-areas-[header,main] grid-rows-[4rem_1fr] min-h-dvh">
      <Header auth={false} />
      <main className="area-[main] container">
        <Outlet />
      </main>
    </div>
  )
}
