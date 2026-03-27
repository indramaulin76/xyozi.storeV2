"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBasket, 
  ClipboardList, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Star
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Kategori", href: "/admin/kategori", icon: <Layers size={20} /> },
    { name: "Produk", href: "/admin/produk", icon: <ShoppingBasket size={20} /> },
    { name: "Flash Sale", href: "/admin/flash-sale", icon: <Zap size={20} /> },
    { name: "Produk Populer", href: "/admin/produk-populer", icon: <Star size={20} /> },
    { name: "Pesanan", href: "/admin/pesanan", icon: <ClipboardList size={20} /> },
    { name: "Error Log", href: "/admin/logs", icon: <AlertCircle size={20} /> },
    { name: "Pengaturan", href: "/admin/pengaturan", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#020617] hidden md:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-black tracking-tighter text-white">
            XYOZI<span className="text-yellow-500">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Panel Pengelolaan
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Server Online</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
