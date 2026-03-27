"use client";

import React, { useState, useEffect } from "react";
import { Star, Search, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProducts, setPopular } from "@/lib/actions/product";
import { formatRupiah } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  isPopular: boolean;
  isFlashSale: boolean;
  flashSalePrice: number | null;
  orderCount: number;
  imageUrl: string | null;
  category: {
    name: string;
  };
}

export default function AdminProdukPopulerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allProducts = await getProducts() as Product[];
    setProducts(allProducts);
    setLoading(false);
  };

  const handleTogglePopular = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const result = await setPopular(productId, !product.isPopular);
    
    if (result.success) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, isPopular: !p.isPopular } : p
      ));
    } else {
      alert(result.error);
    }
  };

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.orderCount - a.orderCount;
    });

  const popularCount = products.filter(p => p.isPopular).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Produk Populer</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola produk yang ditampilkan di section populer.</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 px-5 py-3 rounded-xl">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Produk Populer</p>
          <p className="text-2xl font-black text-yellow-500">{popularCount}</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-white uppercase text-sm">Daftar Produk</h3>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              className="bg-slate-950 border-slate-700 pl-10 h-10 rounded-lg text-sm"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className={`flex items-center gap-4 p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                  product.isPopular ? "bg-yellow-500/5" : ""
                }`}
              >
                <button
                  onClick={() => handleTogglePopular(product.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    product.isPopular 
                      ? "bg-yellow-500 text-black" 
                      : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  }`}
                >
                  {product.isPopular ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm truncate">{product.name}</p>
                    {product.isFlashSale && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">
                        FLASH SALE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{product.category?.name || "Tanpa Kategori"}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-500">
                      {formatRupiah(product.flashSalePrice || product.sellPrice)}
                    </p>
                  </div>

                  <div className="w-24 text-center bg-slate-800 rounded-lg py-2 px-3">
                    <p className="text-[10px] text-slate-500 uppercase">Terjual</p>
                    <p className="text-sm font-bold text-white">{product.orderCount}</p>
                  </div>

                  {product.isPopular && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="text-xs font-bold">Populer</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <div className="flex items-start gap-3 text-xs text-slate-400">
          <div className="w-3 h-3 rounded bg-yellow-500 mt-0.5" />
          <div>
            <p className="font-bold text-white mb-1">Tips:</p>
            <p>Tandai produk sebagai "Populer" untuk menampilkan di section Produk Populer di halaman utama. Produk akan diurutkan berdasarkan jumlah penjualan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
