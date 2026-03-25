"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Filter, Loader2, Save, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getProducts, createProduct, deleteProduct } from "@/lib/actions/product";
import { getCategories } from "@/lib/actions/category";

export default function AdminProdukPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: "",
    skuCode: "",
    name: "",
    basicPrice: 0,
    sellPrice: 0,
    maxPrice: 0,
  });

  const fetchData = async () => {
    setFetching(true);
    const [prodData, catData] = await Promise.all([
      getProducts(),
      getCategories()
    ]);
    setProducts(prodData);
    setCategories(catData);
    setFetching(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.skuCode || !formData.name) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    setLoading(true);
    const result = await createProduct(formData);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      setFormData({
        categoryId: "",
        skuCode: "",
        name: "",
        basicPrice: 0,
        sellPrice: 0,
        maxPrice: 0,
      });
      fetchData();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await deleteProduct(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Kelola Produk</h1>
          <p className="text-sm text-slate-400 mt-1">Daftar layanan top up yang tersedia di toko Anda.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
            <RefreshCw size={16} /> Sync Digiflazz
          </button>

          {/* ADD PRODUCT DIALOG */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 border-none outline-none"
                >
                  <Plus size={18} /> Tambah Manual
                </button>
              }
            />
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Tambah Produk Baru</DialogTitle>
                <DialogDescription className="text-slate-400"> Masukkan detail produk layanan secara manual di sini. </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddProduct} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-bold uppercase text-slate-500 ml-1">Kategori Game</Label>
                    <select 
                      id="category" 
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-xs font-bold uppercase text-slate-500 ml-1">SKU Code (Digiflazz)</Label>
                    <Input 
                      id="sku" 
                      placeholder="Contoh: ML86" 
                      className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                      value={formData.skuCode}
                      onChange={(e) => setFormData({...formData, skuCode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500 ml-1">Nama Produk</Label>
                    <Input 
                      id="name" 
                      placeholder="Contoh: 86 Diamonds" 
                      className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal" className="text-xs font-bold uppercase text-slate-500 ml-1">Harga Modal (Rp)</Label>
                    <Input 
                      id="modal" 
                      type="number" 
                      placeholder="0" 
                      className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                      value={formData.basicPrice}
                      onChange={(e) => setFormData({...formData, basicPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jual" className="text-xs font-bold uppercase text-slate-500 ml-1">Harga Jual (Rp)</Label>
                    <Input 
                      id="jual" 
                      type="number" 
                      placeholder="0" 
                      className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                      value={formData.sellPrice}
                      onChange={(e) => setFormData({...formData, sellPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max" className="text-xs font-bold uppercase text-slate-500 ml-1">Harga Max (Safety)</Label>
                    <Input 
                      id="max" 
                      type="number" 
                      placeholder="0" 
                      className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({...formData, maxPrice: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4 gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    Batal
                  </button>
                  <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />} Simpan Produk
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input placeholder="Cari SKU atau nama produk..." className="bg-slate-950 border-slate-800 pl-10 h-10 rounded-xl text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600">
              <option>Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Harga Modal</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fetching ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data produk...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                      Belum ada data produk yang tersedia.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-blue-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                          {product.category?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{product.skuCode}</td>
                      <td className="px-6 py-4 font-bold text-white text-sm">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">Rp {product.basicPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-black text-blue-400">Rp {product.sellPrice.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {product.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
