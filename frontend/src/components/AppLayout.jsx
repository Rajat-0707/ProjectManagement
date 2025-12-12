import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ---------- SIDEBAR (Desktop) ---------- */}
        <aside className="hidden md:block w-[240px] bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* ---------- PAGE CONTENT ---------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Mobile horizontal project bar */}
          <div className="md:hidden mb-4">
            <Sidebar />
          </div>
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
