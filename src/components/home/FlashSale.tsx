"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface FlashSaleProduct {
  id: string;
  name: string;
  sellPrice: number;
  flashSalePrice: number | null;
  imageUrl: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
}

interface FlashSaleProps {
  products: FlashSaleProduct[];
  endTime: Date | null;
}

export default function FlashSale({ products, endTime }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (products.length === 0) {
    return null;
  }

  const discountPercent = (product: FlashSaleProduct) => {
    if (!product.flashSalePrice) return 0;
    return Math.round((1 - product.flashSalePrice / product.sellPrice) * 100);
  };

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-2 rounded-2xl shadow-lg shadow-yellow-500/30">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Flash Sale</h3>
              <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest">Diskon Terbatas!</p>
            </div>
          </div>

          {endTime && (
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Berakhir dalam</span>
              <div className="flex items-center gap-2">
                <TimerBox value={timeLeft.hours} label="Jam" />
                <span className="text-xl font-bold text-yellow-500 self-center">:</span>
                <TimerBox value={timeLeft.minutes} label="Menit" />
                <span className="text-xl font-bold text-yellow-500 self-center">:</span>
                <TimerBox value={timeLeft.seconds} label="Detik" />
              </div>
            </div>
          )}
        </div>

        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 no-scrollbar snap-x relative z-10">
          {products.map((item) => (
            <Link 
              key={item.id} 
              href={item.category ? `/produk/${item.category.slug}` : "#"} 
              className="snap-start shrink-0 w-[140px] md:w-[180px] group"
            >
              <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3 md:p-4 transition-all duration-300 group-hover:border-yellow-500 shadow-xl relative">
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[9px] font-black text-black px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-md z-10">
                  -{discountPercent(item)}%
                </div>
                <div className="relative aspect-square w-full rounded-lg mb-3 bg-slate-800 p-1.5">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center">
                      <Zap className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-yellow-500 text-[10px] font-black text-black px-2 py-1 rounded-br-lg shadow-md uppercase">
                    Sale
                  </div>
                </div>
                <h4 className="text-[10px] md:text-xs font-bold text-slate-200 line-clamp-2 leading-tight mb-2 h-8">
                  {item.name}
                </h4>
                <div className="space-y-0.5">
                  <p className="text-xs md:text-sm font-black text-yellow-500">
                    {formatRupiah(item.flashSalePrice || item.sellPrice)}
                  </p>
                  <p className="text-[9px] text-slate-500 line-through opacity-60 font-medium">
                    {formatRupiah(item.sellPrice)}
                  </p>
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
      <div className="bg-slate-900 border border-slate-700 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-inner">
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
