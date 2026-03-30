"use client";

import Link from 'next/link';
import { Search, ShoppingBag, LifeBuoy, History, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { getWebsiteSettings } from '@/lib/actions/settings';

interface WebsiteSettings {
  siteName: string
  siteLogo: string | null
  siteLogoText: string
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoText, setLogoText] = useState('Tokomu');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getWebsiteSettings();
    setLogoUrl(settings.siteLogo);
    setLogoText(settings.siteLogoText);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-10 lg:px-12 gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto max-w-[140px] object-contain" 
            />
          ) : (
            <span className="text-lg font-bold tracking-tighter text-white sm:text-2xl">
              {logoText}<span className="text-yellow-500 text-xs sm:text-sm ml-0.5">STORE</span>
            </span>
          )}
        </Link>

        {/* Global Search (Desktop) */}
        <div className="hidden flex-1 px-4 md:flex max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari game..."
              className="h-9 w-full bg-slate-900 border-slate-800 text-slate-200 pl-10 focus:ring-yellow-500 text-sm"
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 lg:flex">
          <Link href="/produk" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ShoppingBag className="h-4 w-4 text-yellow-500" />
            Produk
          </Link>
          <Link href="/bantuan" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <LifeBuoy className="h-4 w-4 text-yellow-500" />
            Bantuan
          </Link>
          <Link href="/transaksi" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <History className="h-4 w-4 text-yellow-500" />
            Cek Transaksi
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="p-1.5 text-slate-300 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-950 border-b border-slate-800 p-4 lg:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <div className="relative w-full md:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari game..."
                className="bg-slate-900 border-slate-800 text-slate-200 pl-10"
              />
            </div>
            <Link href="/produk" className="flex items-center gap-3 py-2 text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>
              <ShoppingBag className="h-5 w-5 text-yellow-500" />
              Produk
            </Link>
            <Link href="/bantuan" className="flex items-center gap-3 py-2 text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>
              <LifeBuoy className="h-5 w-5 text-yellow-500" />
              Bantuan
            </Link>
            <Link href="/transaksi" className="flex items-center gap-3 py-2 text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>
              <History className="h-5 w-5 text-yellow-500" />
              Cek Transaksi
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
