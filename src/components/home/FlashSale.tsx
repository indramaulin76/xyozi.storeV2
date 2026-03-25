"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";

const FLASH_SALE_ITEMS = [
  { id: "fs-1", name: "MLBB 86 Diamonds", price: "Rp 18.250", originalPrice: "Rp 21.000", image: "https://api.v2.tokovoucher.id/storage/produk/thumbnail/1678174411.png" },
  { id: "fs-2", name: "FF 720 Diamonds", price: "Rp 85.000", originalPrice: "Rp 92.000", image: "https://api.v2.tokovoucher.id/storage/produk/thumbnail/1678174364.png" },
  { id: "fs-3", name: "PUBG 60 UC", price: "Rp 12.500", originalPrice: "Rp 15.000", image: "https://api.v2.tokovoucher.id/storage/produk/thumbnail/1678174442.png" },
  { id: "fs-4", name: "GI 60 Genesis", price: "Rp 14.000", originalPrice: "Rp 16.500", image: "https://api.v2.tokovoucher.id/storage/produk/thumbnail/1678174488.png" },
  { id: "fs-5", name: "Robux 100", price: "Rp 16.000", originalPrice: "Rp 19.000", image: "https://api.v2.tokovoucher.id/storage/produk/thumbnail/1678174542.png" },
];

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-red-900/10">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded-2xl shadow-lg shadow-red-600/30 animate-pulse">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight italic uppercase">Flash Sale</h3>
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest opacity-80">🔥 Diskon Terbatas!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Berakhir dalam</span>
            <div className="flex gap-2">
              <TimerBox value={timeLeft.hours} label="Jam" />
              <span className="text-xl font-bold text-red-600 self-center">:</span>
              <TimerBox value={timeLeft.minutes} label="Menit" />
              <span className="text-xl font-bold text-red-600 self-center">:</span>
              <TimerBox value={timeLeft.seconds} label="Detik" />
            </div>
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 no-scrollbar snap-x relative z-10">
          {FLASH_SALE_ITEMS.map((item) => (
            <Link key={item.id} href="/produk/mlbb" className="snap-start shrink-0 w-[140px] md:w-[180px] group">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 md:p-4 transition-all duration-300 group-hover:border-red-600/40 hover:-translate-y-1 shadow-xl">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-slate-900">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <div className="absolute top-0 left-0 bg-red-600 text-[10px] font-black text-white px-2 py-1 rounded-br-lg shadow-md uppercase">
                    Sale
                  </div>
                </div>
                <h4 className="text-[10px] md:text-xs font-bold text-slate-200 line-clamp-2 leading-tight mb-2 h-8">
                  {item.name}
                </h4>
                <div className="space-y-0.5">
                  <p className="text-xs md:text-sm font-black text-red-500">{item.price}</p>
                  <p className="text-[9px] text-slate-500 line-through opacity-60 font-medium">{item.originalPrice}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimerBox({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-slate-950 border border-slate-800 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl shadow-inner">
        <span className="text-lg md:text-xl font-black text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-black mt-1 tracking-tighter">
        {label}
      </span>
    </div>
  );
}
