"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw, Filter, Loader2, Save, Trash2, Percent, Image as ImageIcon, X, CheckCircle, XCircle, Search } from "lucide-react";
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
import { getProducts, createProduct, deleteProduct, syncDigiflazzProducts, checkProductInDigiflazz, bulkAssignCategory, bulkDeleteProducts, deleteProductsWithoutCategory } from "@/lib/actions/product";
import { getCategories } from "@/lib/actions/category";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { formatRupiah } from "@/lib/utils";

export default function AdminProdukPage() {
  const [open, setOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // SKU Validation State
  const [skuValidation, setSkuValidation] = useState<{ status: 'idle' | 'checking' | 'valid' | 'invalid'; product?: any }>({ status: 'idle' });
  const [checkingSku, setCheckingSku] = useState(false);

  // Filter State
  const [filterCategory, setFilterCategory] = useState("");

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filterCategory === "") return true;
      if (filterCategory === "no-category") return product.categoryId === null;
      return product.categoryId === filterCategory;
    });
  }, [products, filterCategory]);

  // Count products without category
  const noCategoryCount = useMemo(() => {
    return products.filter(p => p.categoryId === null).length;
  }, [products]);

  // Bulk Selection State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Toggle single product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle all products selection
  const toggleAllSelection = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle bulk assign category
  const handleBulkAssign = async () => {
    if (!bulkCategoryId) {
      alert("Pilih kategori terlebih dahulu!");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }

    setBulkLoading(true);
    const result = await bulkAssignCategory(selectedProducts, bulkCategoryId);
    setBulkLoading(false);

    if (result.success) {
      alert(result.message);
      setSelectedProducts([]);
      setBulkCategoryId("");
      fetchData();
    } else {
      alert(result.error);
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    if (!confirm(`Lepas kategori dari ${selectedProducts.length} produk yang dipilih? (Produk akan masuk ke Tanpa Kategori)`)) return;

    setBulkLoading(true);
    const result = await bulkAssignCategory(selectedProducts, null);
    setBulkLoading(false);

    if (result.success) {
      alert(result.message);
      setSelectedProducts([]);
      setBulkCategoryId("");
      fetchData();
    } else {
      alert(result.error);
    }
  };

  // Handle bulk delete selected products
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    if (!confirm(`Yakin hapus ${selectedProducts.length} produk yang dipilih?`)) return;

    setBulkLoading(true);
    const result = await bulkDeleteProducts(selectedProducts);
    setBulkLoading(false);

    if (result.success) {
      alert(result.message);
      setSelectedProducts([]);
      fetchData();
    } else {
      alert(result.error);
    }
  };

  // Handle delete ALL products and categories
  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Yakin hapus semua produk TANPA KATEGORI?\n\nProduk yang tidak memiliki kategori akan dihapus permanen!")) return;

    const result = await deleteProductsWithoutCategory();
    if (result.success) {
      alert(result.message);
      setSelectedProducts([]);
      fetchData();
    } else {
      alert(result.error);
    }
  };

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

  // Reset SKU validation when SKU changes
  useEffect(() => {
    if (formData.skuCode.length < 3) {
      setSkuValidation({ status: 'idle' });
    }
  }, [formData.skuCode]);

  const handleCheckSku = async () => {
    if (!formData.skuCode || formData.skuCode.length < 3) {
      alert("SKU Code minimal 3 karakter!");
      return;
    }

    setCheckingSku(true);
    setSkuValidation({ status: 'checking' });
    
    try {
      const result = await checkProductInDigiflazz(formData.skuCode);
      
      setCheckingSku(false);
      
      if (result.success && result.exists && result.product) {
        setSkuValidation({ status: 'valid', product: result.product });
        // Auto-fill form with digiflazz data
        setFormData(prev => ({
          ...prev,
          name: result.product!.name,
          basicPrice: result.product!.price,
          sellPrice: Math.ceil(result.product!.price * 1.1), // Default markup 10%
          maxPrice: result.product!.price * 1.5
        }));
      } else {
        setSkuValidation({ status: 'invalid' });
      }
    } catch (error) {
      setCheckingSku(false);
      setSkuValidation({ status: 'invalid' });
    }
  };

  const handleSync = async () => {
    if (!confirm("Apakah Anda yakin ingin sinkronisasi produk dari Digiflazz? Ini akan memakan waktu beberapa saat.")) return;
    
    setSyncing(true);
    const result = await syncDigiflazzProducts();
    setSyncing(false);

    if (result.success) {
      alert(result.message);
      fetchData();
    } else {
      alert(result.error);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      categoryId: "",
      skuCode: "",
      name: "",
      basicPrice: 0,
      sellPrice: 0,
      maxPrice: 0,
    });
    setSkuValidation({ status: 'idle' });
    setOpen(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.skuCode || !formData.name) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    // Validasi SKU harus ada di Digiflazz
    if (skuValidation.status !== 'valid') {
      alert("Harap validasi SKU Code terlebih dahulu dengan mengeklik tombol Cek!");
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

  const handleOpenImageUpload = (product: any) => {
    setSelectedProduct(product);
    setImageDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Kelola Produk</h1>
          <p className="text-sm text-slate-400 mt-1">Daftar layanan top up yang tersedia di toko Anda.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
            {syncing ? "Syncing..." : "Sync Digiflazz"}
          </button>

          <button 
            onClick={handleDeleteAll}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <Trash2 size={16} /> 
            Hapus Tanpa Kategori
          </button>

          {/* ADD PRODUCT DIALOG */}
          <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setFormData({
                categoryId: "",
                skuCode: "",
                name: "",
                basicPrice: 0,
                sellPrice: 0,
                maxPrice: 0,
              });
              setSkuValidation({ status: 'idle' });
            }
            setOpen(isOpen);
          }}>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-yellow-500/30 transition-all active:scale-95 border-none outline-none"
            >
              <Plus size={18} /> Tambah Manual
            </button>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl rounded-3xl overflow-y-auto max-h-[90vh]">
              <DialogHeader className="pb-4 border-b border-slate-800/50">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Tambah Produk Layanan</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium"> Masukkan detail produk secara manual atau gunakan Sync Digiflazz untuk otomatis. </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddProduct} className="space-y-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-black uppercase text-slate-500 ml-1">Pilih Kategori Game</Label>
                      <select 
                        id="category" 
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl h-14 px-5 text-base outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white appearance-none"
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase text-slate-500 ml-1">Nama Produk (Nominal)</Label>
                      <Input 
                        id="name" 
                        placeholder="Contoh: 86 Diamonds" 
                        className="bg-slate-950 border-slate-800 h-14 rounded-2xl text-lg font-bold"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-xs font-black uppercase text-slate-500 ml-1">SKU Code (Digiflazz) <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input 
                            id="sku" 
                            placeholder="Contoh: ML86" 
                            className={`bg-slate-950 h-14 rounded-2xl font-mono ${
                              skuValidation.status === 'valid' ? 'border-green-500 text-green-400' :
                              skuValidation.status === 'invalid' ? 'border-red-500 text-red-400' :
                              'border-slate-800 text-yellow-400'
                            }`}
                            value={formData.skuCode}
                            onChange={(e) => setFormData({...formData, skuCode: e.target.value.toUpperCase()})}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCheckSku}
                          disabled={checkingSku || !formData.skuCode}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 h-14 rounded-2xl font-bold text-xs uppercase flex items-center gap-2 transition-all"
                        >
                          {checkingSku ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Search size={16} /> Cek
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* SKU Validation Status */}
                      {skuValidation.status === 'checking' && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs mt-2">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Mengecek di Digiflazz...</span>
                        </div>
                      )}
                      {skuValidation.status === 'valid' && skuValidation.product && (
                        <div className="flex items-start gap-2 text-green-400 text-xs mt-2 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold">Produk ditemukan!</p>
                            <p className="text-green-300">{skuValidation.product.name}</p>
                            <p className="text-green-500/70">Harga modal: Rp {skuValidation.product.price.toLocaleString('id-ID')}</p>
                            <p className="text-green-500/70">Brand: {skuValidation.product.brand}</p>
                          </div>
                        </div>
                      )}
                      {skuValidation.status === 'invalid' && (
                        <div className="flex items-center gap-2 text-red-400 text-xs mt-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                          <XCircle size={14} />
                          <span>Produk tidak ditemukan di Digiflazz. Pastikan SKU Code benar.</span>
                        </div>
                      )}
                      {skuValidation.status === 'idle' && (
                        <p className="text-[10px] text-slate-500 mt-2">Klik "Cek" untuk validasi SKU di Digiflazz sebelum menyimpan.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 space-y-6">
                    <h4 className="text-xs font-black uppercase text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Percent size={14} className="text-yellow-500" /> Pengaturan Harga
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="modal" className="text-xs font-black uppercase text-slate-500 ml-1">Harga Modal (Provider)</Label>
                      <div className="relative">
                        <Input 
                          id="modal" 
                          type="number" 
                          placeholder="0" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-2xl text-xl font-bold pl-12"
                          value={formData.basicPrice}
                          onChange={(e) => setFormData({...formData, basicPrice: Number(e.target.value)})}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-600">Rp</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jual" className="text-xs font-black uppercase text-slate-500 ml-1">Harga Jual (Pelanggan)</Label>
                      <div className="relative">
                        <Input 
                          id="jual" 
                          type="number" 
                          placeholder="0" 
                          className="bg-slate-900 border-slate-800 h-14 rounded-2xl text-xl font-black text-yellow-400 pl-12"
                          value={formData.sellPrice}
                          onChange={(e) => setFormData({...formData, sellPrice: Number(e.target.value)})}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-600">Rp</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max" className="text-xs font-black uppercase text-slate-500 ml-1">Harga Batas Aman (Safety)</Label>
                      <div className="relative">
                        <Input 
                          id="max" 
                          type="number" 
                          placeholder="0" 
                          className="bg-slate-900 border-slate-800 h-12 rounded-xl pl-12"
                          value={formData.maxPrice}
                          onChange={(e) => setFormData({...formData, maxPrice: Number(e.target.value)})}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-600 text-xs">Rp</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-6 gap-4 border-t border-slate-800/50 flex-col sm:flex-row">
                  <div className="flex-1">
                    {skuValidation.status !== 'valid' && (
                      <p className="text-[10px] text-red-400 bg-red-500/10 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                        <XCircle size={12} />
                        Validasi SKU diperlukan sebelum menyimpan
                      </p>
                    )}
                    {skuValidation.status === 'valid' && (
                      <p className="text-[10px] text-green-400 bg-green-500/10 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                        <CheckCircle size={12} />
                        SKU valid - siap disimpan
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                      Batal
                    </button>
                    <button type="submit" disabled={loading || skuValidation.status !== 'valid'} className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-black px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-yellow-500/30 active:scale-95 transition-all">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />} Simpan Produk
                    </button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-yellow-500" />
            <select 
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm font-bold rounded-xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {noCategoryCount > 0 && (
                <option value="no-category" className="text-yellow-500">⚠️ Tanpa Kategori ({noCategoryCount})</option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {filterCategory && (
              <button 
                onClick={() => setFilterCategory("")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <X size={14} /> Reset
              </button>
            )}
          </div>
          <span className="text-sm text-slate-500">
            Menampilkan <span className="text-white font-bold">{filteredProducts.length}</span> produk
          </span>
        </div>
        
        {/* Bulk Action Bar */}
        {selectedProducts.length > 0 && (
          <div className="px-6 py-4 bg-yellow-500/10 border-b border-yellow-500/20 flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-yellow-400">
              {selectedProducts.length} produk dipilih
            </span>
            <div className="flex items-center gap-2 flex-1">
              <select 
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="bg-slate-950 border border-yellow-500/30 text-white text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkCategoryId || bulkLoading}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-black px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all"
              >
                {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Assign Kategori
              </button>
              <button
                type="button"
                onClick={handleBulkUnassign}
                disabled={bulkLoading}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all border border-slate-600"
              >
                Lepas Kategori
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        )}
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                    />
                  </th>
                  <th className="px-4 py-4">Gambar</th>
                  <th className="px-4 py-4">Kategori</th>
                  <th className="px-4 py-4">SKU Code</th>
                  <th className="px-4 py-4">Nama Produk</th>
                  <th className="px-4 py-4">Harga Modal</th>
                  <th className="px-4 py-4">Harga Jual</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fetching ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data produk...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500 italic">
                      {products.length === 0 
                        ? "Belum ada data produk yang tersedia." 
                        : "Tidak ada produk yang cocok dengan pencarian."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedProducts.includes(product.id) ? 'bg-yellow-500/10' : ''}`}>
                      <td className="px-4 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleOpenImageUpload(product)}
                          className={`
                            w-12 h-12 rounded-xl overflow-hidden border-2 transition-all
                            ${product.imageUrl 
                              ? "border-slate-700 hover:border-yellow-500" 
                              : "border-dashed border-slate-700 hover:border-yellow-500 bg-slate-800/50"
                            }
                          `}
                        >
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={20} className="text-slate-600" />
                            </div>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {product.categoryId ? (
                          <span className="bg-slate-800 text-yellow-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                            {product.category?.name || "N/A"}
                          </span>
                        ) : (
                          <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                            Tanpa Kategori
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-yellow-500">{product.skuCode}</td>
                      <td className="px-4 py-4 font-bold text-white text-sm">{product.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{formatRupiah(product.basicPrice)}</td>
                      <td className="px-4 py-4 text-sm font-black text-yellow-400">{formatRupiah(product.sellPrice)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {product.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
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

      {/* IMAGE UPLOAD DIALOG */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="pb-4 border-b border-slate-800/50">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Upload Gambar Produk</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Tambahkan gambar untuk produk ini agar lebih menarik di halaman utama.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="py-4">
              <ImageUpload
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                currentImageUrl={selectedProduct.imageUrl}
                onUploadSuccess={() => {
                  fetchData();
                  setImageDialogOpen(false);
                }}
              />
            </div>
          )}
          
          <DialogFooter className="pt-4 border-t border-slate-800/50">
            <button 
              onClick={() => setImageDialogOpen(false)} 
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
