import { Outlet } from "@tanstack/react-router"

import Header from "@/components/Header"
import { SideNav } from "@/components/navs/SideNav"

export const AuthLayout = () => {
  return (
    <div
      className="grid md:grid-areas-[header_header,nav_main] md:grid-cols-[5rem_1fr] md:grid-rows-[4rem_1fr] grid-cols-[1fr] 
      grid-areas-[header,main,nav] grid-rows-[4rem_1fr_3rem] min-h-dvh"
    >
      <Header auth />
      <SideNav />
      <main className="area-[main] p-2 relative">
        <Outlet />
      </main>
    </div>
  )
}
