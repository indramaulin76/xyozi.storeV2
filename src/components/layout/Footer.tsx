"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWebsiteSettings } from '@/lib/actions/settings';

interface WebsiteSettings {
  siteName: string;
  siteLogo: string | null;
  siteLogoText: string;
  footerCopyright: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await getWebsiteSettings();
      setSettings(s);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const brandName = settings?.siteLogoText || "Xyozi";
  const copyright = settings?.footerCopyright || `© ${currentYear} ${brandName} Store. All rights reserved.`;

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 pt-12 pb-8">
      <div className="container mx-auto px-6 md:px-10 lg:px-12 text-center sm:text-left">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
              {settings?.siteLogo ? (
                <img src={settings.siteLogo} alt="Logo" className="h-8" />
              ) : (
                <>
                  {brandName}<span className="text-yellow-500 text-sm">STORE</span>
                </>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Top Up Game Termurah, Tercepat, dan Terpercaya di Indonesia. 
              Proses otomatis 24 jam nonstop untuk kenyamanan gaming Anda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Layanan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/produk" className="hover:text-yellow-500">Semua Game</Link></li>
              <li><Link href="/produk?cat=voucher" className="hover:text-yellow-500">Voucher Game</Link></li>
              <li><Link href="/produk?cat=pulsa" className="hover:text-yellow-500">Pulsa & Data</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Bantuan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/bantuan" className="hover:text-yellow-500">Pusat Bantuan</Link></li>
              <li><Link href="/transaksi" className="hover:text-yellow-500">Cek Pesanan</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Legalitas</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/tos" className="hover:text-yellow-500">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-slate-600">
            {copyright}
          </p>
      </div>
    </footer>
  );
}
