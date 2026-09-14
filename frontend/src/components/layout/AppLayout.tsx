import { Outlet } from "react-router-dom";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Navbar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}