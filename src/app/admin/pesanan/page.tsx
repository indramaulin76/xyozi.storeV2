import React from "react";
import { Search, Filter, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminPesananPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Daftar Pesanan</h1>
          <p className="text-sm text-slate-400 mt-1">Pantau semua transaksi masuk dan status pengirimannya.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
          <Download size={18} /> Export Data
        </button>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input placeholder="Cari ID Invoice..." className="bg-slate-950 border-slate-800 pl-10 h-10 rounded-xl text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-4 py-2 outline-none">
              <option>Semua Status</option>
              <option>PENDING</option>
              <option>SUCCESS</option>
              <option>FAILED</option>
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status Pembayaran</th>
                  <th className="px-6 py-4">Status Layanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {/* Empty */}
              </tbody>
            </table>
          </div>
          <div className="p-12 text-center">
            <p className="text-slate-500 text-sm italic">Belum ada pesanan yang masuk.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
