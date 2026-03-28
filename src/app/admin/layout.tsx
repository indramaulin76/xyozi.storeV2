"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Star,
  Ticket
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoginPage = pathname === "/admin/login";

  // Proteksi Client-side tambahan
  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [status, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="bg-[#020617] min-h-screen">{children}</div>;
  }

  // Jika sedang loading session, tampilkan skeleton/loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Jika tidak terautentikasi (dan bukan halaman login), jangan render apapun selagi nunggu redirect
  if (!session && !isLoginPage) {
    return null;
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Kategori", href: "/admin/kategori", icon: <Layers size={20} /> },
    { name: "Produk", href: "/admin/produk", icon: <ShoppingBasket size={20} /> },
    { name: "Flash Sale", href: "/admin/flash-sale", icon: <Zap size={20} /> },
    { name: "Produk Populer", href: "/admin/produk-populer", icon: <Star size={20} /> },
    { name: "Pesanan", href: "/admin/pesanan", icon: <ClipboardList size={20} /> },
    { name: "Voucher", href: "/admin/voucher", icon: <Ticket size={20} /> },
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

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
          <div className="mb-4 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Login Sebagai</p>
            <p className="text-xs font-bold text-white truncate">{session?.user?.email}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
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
