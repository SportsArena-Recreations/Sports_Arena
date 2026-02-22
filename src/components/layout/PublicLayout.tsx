import { Outlet } from "react-router-dom";
import { HomeNav } from "./HomeNav";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
