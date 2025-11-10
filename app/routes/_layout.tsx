import { Outlet } from "react-router";
import Header from "~/components/shared/header";

export default function Layout() {
  return (
    <>
      <Header />
      <div className="flex flex-col relative h-auto min-h-screen overflow-x-hidden w-full">
        <div className="flex h-full grow flex-col">
          <Outlet />
        </div>
      </div>

    </>);
}
