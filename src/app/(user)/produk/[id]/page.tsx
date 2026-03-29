import React from "react";
import { Zap, Shield, Gem } from "lucide-react";
import OrderForm from "@/components/product/OrderForm";
import { getCategoryBySlug } from "@/lib/actions/category";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryBySlug(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Game Header Banner - Normal scroll */}
      <div className="bg-slate-900">
        <div className="relative w-full aspect-[4/1] overflow-hidden">
          {category.bannerUrl && category.bannerUrl !== "" ? (
            <img 
              src={category.bannerUrl} 
              alt="Game Banner" 
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
          
          <div className="container mx-auto px-4 md:px-8 lg:px-12 h-full flex items-center relative z-10">
            <div className="flex items-center gap-4 md:gap-6 w-full">
              {/* Game Logo */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-yellow-500/30 shadow-xl shadow-yellow-500/10 shrink-0 bg-slate-800">
                {category.logoUrl && category.logoUrl !== "" ? (
                  <img 
                    src={category.logoUrl} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-slate-800">
                    <span className="text-2xl md:text-3xl font-black text-yellow-500">
                      {category.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Game Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                  {category.name}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1 hidden md:block">
                  Top Up {category.name} Diamond - Proses Instan & Aman
                </p>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-2.5 py-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] md:text-xs font-bold text-yellow-500 uppercase tracking-wider">INSTAN</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-wider">AMAN</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full px-2.5 py-1">
                    <Gem className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                    <span className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-wider">TERMURAH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 mt-6">
        <OrderForm category={category as any} />
      </div>
    </div>
  );
}
