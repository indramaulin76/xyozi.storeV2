"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  Zap,
  Info,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createOrder } from "@/lib/actions/order";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  skuCode: string;
}

interface OrderFormProps {
  category: {
    id: string;
    name: string;
    products: Product[];
  };
}

const PAYMENTS = [
  { id: "qris", name: "QRIS", group: "E-Wallet", fee: "1%", image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" },
  { id: "dana", name: "DANA", group: "E-Wallet", fee: "Rp 500", image: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
  { id: "gopay", name: "GOPAY", group: "E-Wallet", fee: "Rp 500", image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" },
  { id: "bca", name: "BCA Virtual Account", group: "VA", fee: "Rp 2.500", image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
];

export default function OrderForm({ category }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [userGameId, setUserGameId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const selectedProduct = category.products.find(p => p.id === selectedProductId);
  const selectedPayment = PAYMENTS.find(p => p.id === selectedPaymentId);

  const handleSubmit = async () => {
    if (!selectedProductId || !selectedPaymentId || !userGameId) {
      alert("Harap lengkapi semua data pesanan!");
      return;
    }

    setLoading(true);
    const result = await createOrder({
      userGameId,
      zoneId,
      productId: selectedProductId,
      amount: selectedProduct?.sellPrice || 0,
    });
    setLoading(false);

    if (result.success) {
      router.push(`/transaksi/${result.referenceId}`);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Form Area */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Step 1: User ID */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white">1</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Masukkan Data Akun</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">User ID</label>
                <Input 
                  placeholder="Contoh: 12345678" 
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl text-white" 
                  value={userGameId}
                  onChange={(e) => setUserGameId(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Zone ID (Opsional)</label>
                <Input 
                  placeholder="Contoh: 1234" 
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl text-white" 
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 italic flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Masukkan data akun Anda dengan benar untuk menghindari kesalahan pengiriman.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: Nominals */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white">2</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Pilih Nominal Layanan</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {category.products.map((item) => (
                <button
                  key={item.id}
                  disabled={loading}
                  onClick={() => setSelectedProductId(item.id)}
                  className={`relative group p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedProductId === item.id 
                    ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <p className={`font-black text-xs md:text-sm uppercase ${selectedProductId === item.id ? 'text-blue-400' : 'text-white'}`}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Rp {item.sellPrice.toLocaleString()}</p>
                  {selectedProductId === item.id && (
                    <div className="absolute bottom-2 right-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Payments */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white">3</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Pilih Metode Pembayaran</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              {PAYMENTS.map((method) => (
                <button
                  key={method.id}
                  disabled={loading}
                  onClick={() => setSelectedPaymentId(method.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedPaymentId === method.id 
                    ? 'border-blue-600 bg-blue-600/10 shadow-lg' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-white rounded-md p-1.5 flex items-center justify-center overflow-hidden">
                      <img src={method.image} alt={method.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs md:text-sm font-bold text-white uppercase">{method.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{method.group}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-xs font-bold text-blue-400">Biaya: {method.fee}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Area */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          <Card className="bg-blue-600 border-none rounded-3xl overflow-hidden shadow-2xl shadow-blue-600/20">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-white fill-white" />
                <h3 className="text-lg font-black text-white uppercase italic">Ringkasan Pesanan</h3>
              </div>
              
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/70">
                  <span>Item</span>
                  <span className="text-white text-right max-w-[150px] line-clamp-1">{selectedProduct?.name || "-"}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/70">
                  <span>Metode</span>
                  <span className="text-white">{selectedPayment?.name || "-"}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/20">
                  <span className="text-lg font-black text-white uppercase">Total</span>
                  <span className="text-lg font-black text-white">
                    Rp {selectedProduct ? selectedProduct.sellPrice.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!selectedProductId || !selectedPaymentId || !userGameId || loading}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 disabled:bg-white/50 disabled:text-blue-600/50 font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 text-center uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Beli Sekarang"}
              </button>
            </CardContent>
          </Card>

          {/* Trust Badge */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            <h4 className="text-sm font-bold text-white uppercase">Jaminan Keamanan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua transaksi diproses secara otomatis dan aman menggunakan enkripsi SSL tingkat tinggi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
