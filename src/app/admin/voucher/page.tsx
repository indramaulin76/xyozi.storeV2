"use client";

import { useState, useEffect } from "react";
import { Ticket, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Voucher {
  id: string;
  code: string;
  type: string;
  discountPrice: number;
  discountPercent: number;
  discountAdmin: number;
  minTransaction: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiredAt: string | null;
  createdAt: string;
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "BOTH",
    discountPrice: 0,
    discountPercent: 0,
    discountAdmin: 0,
    minTransaction: 0,
    maxUses: 0,
    expiredAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/voucher");
      const data = await res.json();
      setVouchers(data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchVouchers();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal membuat voucher");
      }
    } catch (error) {
      console.error("Error creating voucher:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/voucher/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchVouchers();
      }
    } catch (error) {
      console.error("Error toggling voucher:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus voucher ini?")) return;

    try {
      const res = await fetch(`/api/admin/voucher/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchVouchers();
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "BOTH",
      discountPrice: 0,
      discountPercent: 0,
      discountAdmin: 0,
      minTransaction: 0,
      maxUses: 0,
      expiredAt: "",
    });
    setEditingVoucher(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PRICE":
        return "Harga";
      case "ADMIN":
        return "Admin";
      case "BOTH":
        return "Harga + Admin";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Kelola Voucher</h1>
          <p className="text-slate-400 text-sm mt-1">Buat dan kelola kode diskon untuk pelanggan</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Voucher
        </button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-yellow-500" />
            Daftar Voucher
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Kode</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Tipe</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Diskon</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Min Transaksi</th>
                  <th className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Used</th>
                  <th className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Expired</th>
                  <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-500 py-8">
                      Belum ada voucher
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-yellow-500">{voucher.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">{getTypeLabel(voucher.type)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {voucher.discountPercent > 0 && (
                            <span className="text-sm text-emerald-400">{voucher.discountPercent}%</span>
                          )}
                          {voucher.discountPrice > 0 && (
                            <span className="text-sm text-emerald-400 block">{formatRupiah(voucher.discountPrice)}</span>
                          )}
                          {voucher.discountAdmin > 0 && (
                            <span className="text-sm text-blue-400 block">Admin: {formatRupiah(voucher.discountAdmin)}</span>
                          )}
                          {voucher.discountPercent === 0 && voucher.discountPrice === 0 && voucher.discountAdmin === 0 && (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {voucher.minTransaction > 0 ? formatRupiah(voucher.minTransaction) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-300">
                          {voucher.usedCount}
                          {voucher.maxUses > 0 && <span className="text-slate-500"> / {voucher.maxUses}</span>}
                          {voucher.maxUses === 0 && <span className="text-slate-500"> (unlimited)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(voucher.id, voucher.isActive)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            voucher.isActive
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {voucher.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" /> Aktif
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" /> Nonaktif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {voucher.expiredAt ? new Date(voucher.expiredAt).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-black text-white uppercase">Tambah Voucher</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Kode Voucher *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="CONTOH: DISKON10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Tipe Diskon</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="BOTH">Harga + Admin Fee</option>
                  <option value="PRICE">Harga Saja</option>
                  <option value="ADMIN">Admin Fee Saja</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Diskon Harga (Rp)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Diskon (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="10"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Diskon Admin (Rp)</label>
                  <input
                    type="number"
                    value={formData.discountAdmin}
                    onChange={(e) => setFormData({ ...formData, discountAdmin: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Min Transaksi (Rp)</label>
                  <input
                    type="number"
                    value={formData.minTransaction}
                    onChange={(e) => setFormData({ ...formData, minTransaction: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Max Penggunaan (0 = unlimited)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Expired (Opsional)</label>
                <input
                  type="date"
                  value={formData.expiredAt}
                  onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
