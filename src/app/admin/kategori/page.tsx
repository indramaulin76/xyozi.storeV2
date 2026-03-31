"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, Image as ImageIcon, Percent, FileText, Upload, FormInput, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/category";

export default function AdminKategoriPage() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ logo: boolean; banner: boolean }>({ logo: false, banner: false });
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    bannerUrl: "",
    description: "",
    markupPercent: 10,
    menuSection: "topup",
    field1Label: "User ID",
    field1Placeholder: "",
    field2Label: "",
    field2Placeholder: "",
    field2Required: false,
    digiflazzBrand: "",
    digiflazzCategory: "",
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Rekomendasi Validasi (Opsional)
    if (file.size > 500 * 1024) { // 500KB limit
       alert("File terlalu besar! Rekomendasi < 300KB agar loading cepat.");
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      
      if (data.url) {
        setFormData(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'bannerUrl']: data.url }));
      }
    } catch (error) {
      alert("Gagal upload gambar!");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedId("");
    setFormData({
      name: "",
      slug: "",
      logoUrl: "",
      bannerUrl: "",
      description: "",
      markupPercent: 10,
      menuSection: "topup",
      field1Label: "User ID",
      field1Placeholder: "",
      field2Label: "",
      field2Placeholder: "",
      field2Required: false,
      digiflazzBrand: "",
      digiflazzCategory: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditMode(true);
    setSelectedId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      logoUrl: category.logoUrl || "",
      bannerUrl: category.bannerUrl || "",
      description: category.description || "",
      markupPercent: category.markupPercent || 10,
      menuSection: category.menuSection || "topup",
      field1Label: category.field1Label || "User ID",
      field1Placeholder: category.field1Placeholder || "",
      field2Label: category.field2Label || "",
      field2Placeholder: category.field2Placeholder || "",
      field2Required: category.field2Required || false,
      digiflazzBrand: category.digiflazzBrand || "",
      digiflazzCategory: category.digiflazzCategory || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = editMode 
      ? await updateCategory(selectedId, formData)
      : await createCategory(formData);

    setLoading(false);

    if (result.success) {
      setOpen(false);
      fetchData();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua produk di dalamnya juga akan terpengaruh.")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!editMode && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editMode]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Kelola Kategori</h1>
          <p className="text-sm text-slate-400 mt-1">Gunakan gambar rasio 1:1 (Logo) dan 16:9 (Banner) untuk hasil terbaik.</p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="bg-slate-950 border-slate-800 text-white max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 border-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-blue-600 p-8 flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white">
                {editMode ? "Pengaturan Kategori" : "Tambah Kategori Baru"}
              </DialogTitle>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Konfigurasi Game, Visual & Profitabilitas</p>
            </div>
            <button onClick={() => setOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
               <Plus className="rotate-45 w-6 h-6 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* LEFT COLUMN: BASIC INFO */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-blue-500 tracking-[0.2em] flex items-center gap-2">
                    <FileText size={14} /> Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nama Produk / Game</Label>
                      <Input 
                        placeholder="Contoh: Mobile Legends" 
                        className="bg-slate-900 border-slate-800 h-16 rounded-2xl text-xl font-black focus:ring-blue-600 focus:border-blue-600 transition-all px-6"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">URL Slug</Label>
                      <Input 
                        placeholder="mobile-legends" 
                        className="bg-slate-900 border-slate-800 h-14 rounded-xl font-mono text-blue-400 px-6"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Input Labels Section */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black uppercase text-purple-500 tracking-[0.2em] flex items-center gap-2">
                    <FormInput size={14} /> Label & Placeholder Form Input
                  </h4>
                  <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-[30px] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Label Input Utama</Label>
                        <Input 
                          placeholder="Contoh: User ID, Riot ID, UID, Nomor HP" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-xl text-base font-bold px-6 focus:ring-purple-500"
                          value={formData.field1Label}
                          onChange={(e) => setFormData({...formData, field1Label: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Placeholder Input Utama</Label>
                        <Input 
                          placeholder="Contoh: 1234567, os_asia" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-xl text-base font-bold px-6 focus:ring-purple-500"
                          value={formData.field1Placeholder}
                          onChange={(e) => setFormData({...formData, field1Placeholder: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Label Input Kedua</Label>
                        <Input 
                          placeholder="Contoh: Zone ID, Server (kosongkan jika tidak perlu)" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-xl text-base font-bold px-6 focus:ring-purple-500"
                          value={formData.field2Label}
                          onChange={(e) => setFormData({...formData, field2Label: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Placeholder Input Kedua</Label>
                        <Input 
                          placeholder="Contoh: os_asia untuk Asia" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-xl text-base font-bold px-6 focus:ring-purple-500"
                          value={formData.field2Placeholder}
                          onChange={(e) => setFormData({...formData, field2Placeholder: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="field2Required"
                        checked={formData.field2Required}
                        onChange={(e) => setFormData({...formData, field2Required: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="field2Required" className="text-sm font-bold text-white cursor-pointer">Wajib Diisi</Label>
                        <p className="text-[11px] text-slate-500 font-medium">Aktifkan jika input kedua wajib diisi (contoh: untuk voucher games tertentu)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digiflazz Brand Section */}
                  <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black uppercase text-yellow-500 tracking-[0.2em] flex items-center gap-2">
                    <Link2 size={14} /> Integrasi Digiflazz
                  </h4>
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-[30px] space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Brand Digiflazz</Label>
                      <Input 
                        placeholder="Contoh: Mobile Legends, Free Fire, Point Blank" 
                        className="bg-slate-900 border-slate-800 h-14 rounded-xl text-base font-bold px-6 focus:ring-yellow-500"
                        value={formData.digiflazzBrand}
                        onChange={(e) => setFormData({...formData, digiflazzBrand: e.target.value})}
                      />
                      <p className="text-[11px] text-slate-500 font-medium">
                        Masukkan nama brand persis seperti di API Digiflazz (contoh: MOBILE LEGENDS, TELKOMSEL).
                        Sistem menormalisasi spasi dan huruf besar/kecil; produk akan otomatis masuk ke kategori ini saat sinkronisasi.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Kategori Digiflazz</Label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 h-14 rounded-xl text-base font-bold text-slate-200 px-6 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                        value={formData.digiflazzCategory}
                        onChange={(e) => setFormData({...formData, digiflazzCategory: e.target.value})}
                      >
                        <option value="">Pilih Kategori (Opsional)</option>
                        <option value="Pulsa">Pulsa</option>
                        <option value="Data">Paket Data</option>
                        <option value="Game">Game (Top-Up)</option>
                        <option value="Voucher">Voucher Game</option>
                        <option value="PLN">PLN (Token/Tagihan)</option>
                        <option value="E-Money">E-Money</option>
                        <option value="PPOB">PPOB (Tagihan)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Kategori produk dari API Digiflazz. Digunakan untuk mapping otomatis saat sinkronisasi.
                        Kombinasikan dengan Brand untuk hasil terbaik.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2">
                    <Percent size={14} /> Pengaturan Menu & Profit
                  </h4>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[30px] space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Menu Section</Label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 h-14 rounded-xl text-base font-bold text-slate-200 px-6 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        value={formData.menuSection}
                        onChange={(e) => setFormData({...formData, menuSection: e.target.value})}
                      >
                        <option value="topup">Top Up Game</option>
                        <option value="voucher">Voucher Game</option>
                        <option value="pulsa">Pulsa</option>
                        <option value="token">Token Listrik</option>
                        <option value="data">Paket Data</option>
                      </select>
                      <p className="text-[11px] text-slate-500 font-medium">Pilih section menu untuk menampilkan kategori ini.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Markup Keuntungan (%)</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          placeholder="10" 
                          className="bg-slate-900 border-slate-800 h-20 rounded-2xl text-4xl font-black text-emerald-500 pl-8 pr-16 focus:ring-emerald-500"
                          value={formData.markupPercent}
                          onChange={(e) => setFormData({...formData, markupPercent: Number(e.target.value)})}
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700">%</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                      Sistem akan otomatis menghitung Harga Jual = Harga Modal + {formData.markupPercent}% saat sinkronisasi Digiflazz.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* RIGHT COLUMN: VISUAL ASSETS */}
              <div className="space-y-8">
                <h4 className="text-xs font-black uppercase text-amber-500 tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon size={14} /> Aset Visual
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* UPLOAD LOGO */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Logo Game (1:1)</Label>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="relative aspect-square bg-slate-900 border-2 border-dashed border-slate-800 rounded-[30px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-600/5 transition-all overflow-hidden group"
                    >
                       {uploading.logo ? (
                         <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                       ) : formData.logoUrl ? (
                         <div className="relative w-full h-full p-6 flex items-center justify-center">
                            <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-all" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                               <Upload className="w-10 h-10 text-white" />
                            </div>
                         </div>
                       ) : (
                         <>
                            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl">
                               <Upload className="w-8 h-8 text-slate-600 group-hover:text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upload Logo</span>
                         </>
                       )}
                       <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                    </div>
                  </div>

                  {/* UPLOAD BANNER */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Banner Hero (16:9)</Label>
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className="relative aspect-square bg-slate-900 border-2 border-dashed border-slate-800 rounded-[30px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-600/5 transition-all overflow-hidden group"
                    >
                       {uploading.banner ? (
                         <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                       ) : formData.bannerUrl ? (
                         <div className="relative w-full h-full">
                            <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover brightness-50 group-hover:brightness-30 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                               <Upload className="w-10 h-10 text-white" />
                            </div>
                         </div>
                       ) : (
                         <>
                            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl">
                               <Upload className="w-8 h-8 text-slate-600 group-hover:text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upload Banner</span>
                         </>
                       )}
                       <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* FULL WIDTH: DESCRIPTION */}
              <div className="lg:col-span-2 space-y-4 pt-6 border-t border-slate-900">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                  <FileText size={14} /> Petunjuk Order / Deskripsi
                </h4>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-800 rounded-[30px] p-8 text-base min-h-[150px] outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-300 leading-relaxed shadow-inner"
                  placeholder="Masukkan petunjuk bagi pelanggan (misal: 'Masukkan User ID (Server) Anda dengan benar...')"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-10">
              <button 
                type="button" 
                onClick={() => setOpen(false)} 
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-slate-800"
              >
                Batalkan Perubahan
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/40 active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={20} />} 
                {editMode ? "Simpan Perubahan Data" : "Terbitkan Kategori Baru"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {fetching ? (
          <div className="col-span-full py-20 text-center">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Data Kategori...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
             <p className="text-slate-500 italic">Belum ada kategori yang ditambahkan.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-blue-600/50 transition-all group">
              <div className="relative h-32 w-full overflow-hidden bg-slate-800">
                {cat.bannerUrl ? (
                  <img src={cat.bannerUrl} alt="banner" className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-all" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                     <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center p-1">
                      {cat.logoUrl ? (
                        <img src={cat.logoUrl} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-black text-blue-500 text-xs">{cat.name.substring(0, 2).toUpperCase()}</span>
                      )}
                   </div>
                   <div className="text-white font-black uppercase tracking-tighter text-sm">{cat.name}</div>
                </div>
              </div>
              <CardContent className="p-5">
                 <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase">Produk</p>
                       <p className="text-xs font-bold text-white">{cat._count?.products || 0} Item</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase">Profit</p>
                       <p className="text-xs font-bold text-blue-400">{cat.markupPercent}%</p>
                    </div>
                 </div>
                 <div className="flex gap-2 pt-4 border-t border-slate-800">
                    <button 
                      onClick={() => handleOpenEdit(cat)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
