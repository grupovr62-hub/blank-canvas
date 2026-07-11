import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}