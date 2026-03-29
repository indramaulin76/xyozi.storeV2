"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PopularProduct {
  id: string;
  name: string;
  sellPrice: number;
  imageUrl: string | null;
  orderCount: number;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface PopularProductsProps {
  initialProducts: PopularProduct[];
}

export default function PopularProducts({ initialProducts }: PopularProductsProps) {
  const [products, setProducts] = useState<PopularProduct[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);

  console.log("[PopularProducts] initialProducts:", initialProducts?.length);

  if (!products || products.length === 0) {
    return null;
  }

  const sortedProducts = [...products].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-8">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-2xl shadow-lg shadow-yellow-500/30">
            <Star className="w-6 h-6 text-black fill-black" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Produk Populer</h3>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest">Paling Banyak Dibeli</p>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 no-scrollbar snap-x relative z-10">
          {sortedProducts.map((item) => (
            <Link 
              key={item.id} 
              href={`/produk/${item.category?.slug || 'umum'}`} 
              className="snap-start shrink-0 w-[140px] md:w-[180px] group"
            >
              <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3 md:p-4 transition-all duration-300 group-hover:border-yellow-500 shadow-xl">
                <div className="relative aspect-square w-full rounded-lg mb-3 bg-slate-800 p-1.5">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center">
                      <Star className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[10px] font-black text-black px-2 py-1 rounded-br-lg shadow-md uppercase flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    Populer
                  </div>
                </div>
                <h4 className="text-[10px] md:text-xs font-bold text-slate-200 line-clamp-2 leading-tight mb-2 h-8">
                  {item.name}
                </h4>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm font-black text-yellow-500">
                    {formatRupiah(item.sellPrice)}
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">
                    {item.orderCount} terjual
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
