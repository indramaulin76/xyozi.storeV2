"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Save } from "lucide-react";
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
import { getCategories, createCategory, deleteCategory } from "@/lib/actions/category";

export default function AdminKategoriPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: "",
  });

  const fetchData = async () => {
    setFetching(true);
    const data = await getCategories();
    setCategories(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Nama dan Slug wajib diisi!");
      return;
    }

    setLoading(true);
    const result = await createCategory(formData);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      setFormData({ name: "", slug: "", logoUrl: "" });
      fetchData();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua produk di dalamnya juga akan terpengaruh.")) {
      const result = await deleteCategory(id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error);
      }
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Kelola Kategori</h1>
          <p className="text-sm text-slate-400 mt-1">Tambahkan atau ubah kategori game di toko Anda.</p>
        </div>
        
        {/* ADD CATEGORY DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 border-none outline-none"
              >
                <Plus size={18} /> Tambah Kategori
              </button>
            }
          />
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Tambah Kategori</DialogTitle>
              <DialogDescription className="text-slate-400"> Masukkan detail kategori game baru. </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddCategory} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500 ml-1">Nama Game</Label>
                  <Input 
                    id="name" 
                    placeholder="Contoh: Mobile Legends" 
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase text-slate-500 ml-1">Slug (URL)</Label>
                  <Input 
                    id="slug" 
                    placeholder="mobile-legends" 
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl font-mono text-xs"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-xs font-bold uppercase text-slate-500 ml-1">Logo URL (Optional)</Label>
                  <Input 
                    id="logo" 
                    placeholder="https://example.com/logo.png" 
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 gap-3">
                <button type="button" onClick={() => setOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />} Simpan Kategori
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input placeholder="Cari kategori..." className="bg-slate-950 border-slate-800 pl-10 h-10 rounded-xl text-sm" />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Logo</th>
                  <th className="px-6 py-4">Nama Game</th>
                  <th className="px-6 py-4">Slug (URL)</th>
                  <th className="px-6 py-4">Jumlah Produk</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fetching ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat kategori...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Belum ada data kategori yang tersedia.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
                          {cat.logoUrl ? (
                            <img src={cat.logoUrl} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-500">
                              {cat.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-sm">{cat.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">
                          {cat._count?.products || 0} Produk
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
