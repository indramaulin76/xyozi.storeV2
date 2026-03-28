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
  AlertCircle,
  Zap,
  Star
} from "lucide-react";
import { signOut } from "next-auth/react";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
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
  );
}
