"use client";

import React, { useState, useEffect } from "react";
import { Zap, Search, Check, X, Clock, Loader2, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProducts, setFlashSale, getFlashSaleProducts } from "@/lib/actions/product";
import { getFlashSaleSettings, updateFlashSaleSettings } from "@/lib/actions/settings";
import { formatRupiah } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  flashSalePrice: number | null;
  isFlashSale: boolean;
  imageUrl: string | null;
  category: {
    name: string;
  };
}

interface FlashSaleSettings {
  enabled: boolean;
  endTime: Date | null;
}

export default function AdminFlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<string[]>([]);
  const [settings, setSettings] = useState<FlashSaleSettings>({ enabled: false, endTime: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [customEndTime, setCustomEndTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (settings.endTime) {
      const date = new Date(settings.endTime);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setCustomEndTime(localDate.toISOString().slice(0, 16));
    }
  }, [settings.endTime]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allProducts, fsProducts, fsSettings] = await Promise.all([
      getProducts() as Promise<Product[]>,
      getFlashSaleProducts(),
      getFlashSaleSettings()
    ]);
    setProducts(allProducts);
    setFlashSaleProducts(fsProducts.map((p: any) => p.id));
    setSettings(fsSettings);

    const initialPrices: Record<string, string> = {};
    fsProducts.forEach((p: any) => {
      initialPrices[p.id] = p.flashSalePrice?.toString() || "";
    });
    setPriceInputs(initialPrices);

    setLoading(false);
  };

  const handleToggleProduct = async (product: Product) => {
    const isCurrentlyFs = flashSaleProducts.includes(product.id);
    const price = priceInputs[product.id] ? parseFloat(priceInputs[product.id]) : undefined;
    
    if (!isCurrentlyFs && price && price >= product.sellPrice) {
      alert("Harga flash sale harus lebih murah dari harga normal!");
      return;
    }

    const result = await setFlashSale(product.id, !isCurrentlyFs, price);
    
    if (result.success) {
      if (!isCurrentlyFs) {
        setFlashSaleProducts(prev => [...prev, product.id]);
      } else {
        setFlashSaleProducts(prev => prev.filter(id => id !== product.id));
      }
    } else {
      alert(result.error);
    }
  };

  const handlePriceChange = (productId: string, value: string) => {
    setPriceInputs(prev => ({ ...prev, [productId]: value }));
  };

  const handleToggleEnabled = async () => {
    setSaving(true);
    const newEnabled = !settings.enabled;
    let endTime: string | undefined;
    
    if (newEnabled) {
      if (customEndTime) {
        endTime = new Date(customEndTime).toISOString();
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 0);
        endTime = tomorrow.toISOString();
      }
    }

    const result = await updateFlashSaleSettings(newEnabled, endTime);
    
    if (result.success) {
      setSettings({
        enabled: newEnabled,
        endTime: endTime ? new Date(endTime) : null
      });
    }
    setSaving(false);
  };

  const handleUpdateEndTime = async () => {
    if (!customEndTime) return;
    setSaving(true);
    
    const endTime = new Date(customEndTime).toISOString();
    const result = await updateFlashSaleSettings(settings.enabled, endTime);
    
    if (result.success) {
      setSettings(prev => ({ ...prev, endTime: new Date(endTime) }));
      alert("Waktu berhasil diupdate!");
    } else {
      alert(result.error);
    }
    setSaving(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Flash Sale</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola produk flash sale dan pengaturan.</p>
        </div>
        <button
          onClick={handleToggleEnabled}
          disabled={saving}
          className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all ${
            settings.enabled 
              ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" 
              : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
          }`}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : settings.enabled ? (
            <ToggleRight className="w-5 h-5" />
          ) : (
            <ToggleLeft className="w-5 h-5" />
          )}
          {settings.enabled ? "Nonaktifkan Flash Sale" : "Aktifkan Flash Sale"}
        </button>
      </div>

      <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Waktu Berakhir Flash Sale</p>
              {settings.endTime && (
                <p className="text-white font-bold">
                  {new Date(settings.endTime).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                Atur Waktu Berakhir
              </label>
              <Input
                type="datetime-local"
                className="bg-slate-950 border-slate-700 h-11 rounded-xl"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
              />
            </div>
            <button
              onClick={handleUpdateEndTime}
              disabled={saving || !customEndTime}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-white uppercase text-sm">Pilih Produk Flash Sale</h3>
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
            {filteredProducts.map((product) => {
              const isFlashSale = flashSaleProducts.includes(product.id);
              const discount = priceInputs[product.id] 
                ? Math.round((1 - parseFloat(priceInputs[product.id]) / product.sellPrice) * 100)
                : 0;

              return (
                <div 
                  key={product.id}
                  className={`flex items-center gap-4 p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                    isFlashSale ? "bg-yellow-500/5" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggleProduct(product)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isFlashSale 
                        ? "bg-yellow-500 text-black" 
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    {isFlashSale ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category?.name || "Tanpa Kategori"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 line-through">
                        {formatRupiah(product.sellPrice)}
                      </p>
                      {isFlashSale && priceInputs[product.id] && (
                        <p className="text-sm font-bold text-yellow-500">
                          {formatRupiah(parseFloat(priceInputs[product.id]))}
                          <span className="text-xs text-green-400 ml-1">-{discount}%</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="w-32">
                      <Input
                        className={`h-9 text-xs rounded-lg ${
                          isFlashSale 
                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" 
                            : "bg-slate-950 border-slate-700 text-slate-400"
                        }`}
                        placeholder="Harga Sale"
                        value={priceInputs[product.id] || ""}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        disabled={!isFlashSale}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Produk yang ditandai kuning adalah produk flash sale aktif</span>
        </div>
      </div>
    </div>
  );
}
