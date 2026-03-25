"use client";

import React, { useState } from "react";
import { History, Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TransaksiPage() {
  const [invoice, setInvoice] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            Cek Transaksi
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Lacak status pesanan Anda secara real-time. Masukkan nomor invoice yang Anda dapatkan setelah melakukan pembayaran.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Nomor Invoice</label>
              <div className="relative">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  placeholder="Contoh: INV-20260325-12345"
                  className="bg-slate-950 border-slate-800 h-16 rounded-2xl text-white pl-14 text-base focus:ring-blue-500"
                />
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              <Search className="w-5 h-5" />
              Lacak Pesanan
            </button>
          </CardContent>
        </Card>

        {/* Empty State / Placeholder for Results */}
        <div className="text-center border-2 border-dashed border-slate-800 rounded-3xl p-12">
          <History className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-400">Belum Ada Pencarian</h3>
          <p className="text-sm text-slate-500 mt-2">Silakan masukkan nomor invoice di atas untuk melihat detail pesanan Anda.</p>
        </div>
      </div>
    </div>
  );
}
