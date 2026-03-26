"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Zap,
  Info,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createOrder } from "@/lib/actions/order";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { getPaymentMethod } from "@/lib/payment-methods";

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  skuCode: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface OrderFormProps {
  category: Category;
}

export default function OrderForm({ category }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("QRIS");
  const [userGameId, setUserGameId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalFee, setTotalFee] = useState(0);

  const selectedProduct = category.products.find(p => p.id === selectedProductId);
  const selectedPayment = getPaymentMethod(selectedPaymentId);

  const handleMethodChange = (method: string, total: number, fee: number) => {
    setSelectedPaymentId(method);
    setTotalPayment(total);
    setTotalFee(fee);
  };

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
      paymentMethod: selectedPaymentId,
    });
    setLoading(false);

    if (result?.error) {
      alert(result.error);
    }
  };

  const displayTotal = totalPayment > 0 ? totalPayment : (selectedProduct?.sellPrice || 0);
  const displayFee = totalFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        
        {/* Step 1: User ID */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border-t-4 border-t-blue-600">
          <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-xs">01</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Masukkan Data Akun</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">User ID / Server</label>
                <div className="relative">
                   <Input 
                    placeholder="Contoh: 12345678" 
                    className="bg-slate-950 border-slate-800 h-14 rounded-2xl text-white pl-5 focus:ring-blue-600 focus:border-blue-600 transition-all font-mono" 
                    value={userGameId}
                    onChange={(e) => setUserGameId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Zone ID (Opsional)</label>
                <Input 
                  placeholder="Contoh: 1234" 
                  className="bg-slate-950 border-slate-800 h-14 rounded-2xl text-white pl-5 focus:ring-blue-600 focus:border-blue-600 transition-all font-mono" 
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Silakan masukkan <span className="text-white font-bold italic">User ID</span> dan <span className="text-white font-bold italic">Zone ID</span> akun Anda dengan benar. Kesalahan penginputan data sepenuhnya tanggung jawab pembeli.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Nominals */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-xs">02</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Pilih Nominal Layanan</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {category.products.map((item) => (
                <button
                  key={item.id}
                  disabled={loading}
                  onClick={() => {
                    setSelectedProductId(item.id);
                    if (selectedPaymentId) {
                      const { calculateFee } = require("@/lib/payment-methods");
                      try {
                        const feeCalc = calculateFee(selectedPaymentId, item.sellPrice);
                        setTotalPayment(feeCalc.totalPayment);
                        setTotalFee(feeCalc.totalFee);
                      } catch (e) {}
                    }
                  }}
                  className={`relative group p-5 rounded-2xl border-2 transition-all text-left flex flex-col justify-between min-h-[100px] ${
                    selectedProductId === item.id 
                    ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className={`font-black text-xs md:text-sm uppercase leading-tight ${selectedProductId === item.id ? 'text-blue-400' : 'text-white'}`}>
                      {item.name}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Proses Instan</p>
                  </div>
                  <p className={`text-xs font-black mt-4 ${selectedProductId === item.id ? 'text-white' : 'text-slate-400'}`}>
                    Rp {item.sellPrice.toLocaleString("id-ID")}
                  </p>
                  {selectedProductId === item.id && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-600 rounded-full p-0.5">
                        <ShieldCheck className="w-3 h-3 text-white fill-blue-600" />
                      </div>
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
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-black text-white text-xs">03</div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Pilih Metode Pembayaran</h3>
          </div>
          <CardContent className="p-6">
            {selectedProduct ? (
              <PaymentMethodSelector
                amount={selectedProduct.sellPrice}
                selectedMethod={selectedPaymentId}
                onMethodChange={handleMethodChange}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Pilih nominal layanan terlebih dahulu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Area */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-blue-600 p-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-white fill-white" />
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Konfirmasi Pesanan</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Target Akun</span>
                    <span className="text-white text-right font-mono">
                      {userGameId ? `${userGameId}${zoneId ? ` (${zoneId})` : ''}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Produk</span>
                    <span className="text-white text-right max-w-[150px] line-clamp-1">{selectedProduct?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Pembayaran</span>
                    <span className="text-white">{selectedPayment?.name || "-"}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                      <span>Harga Produk</span>
                      <span className="text-white">Rp {selectedProduct?.sellPrice.toLocaleString("id-ID") || "0"}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                      <span>Biaya Admin</span>
                      <span className="text-white">Rp {displayFee.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between pt-4 mt-2 border-t-2 border-dashed border-slate-800">
                      <span className="text-xl font-black text-white uppercase tracking-tighter">Total</span>
                      <span className="text-2xl font-black text-blue-500">
                        Rp {displayTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleSubmit}
                    disabled={!selectedProductId || !selectedPaymentId || !userGameId || loading}
                    className="group w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2 text-white"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Proses Pembayaran
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-center text-slate-500 font-medium px-4">
                    Dengan mengeklik tombol di atas, Anda menyetujui <span className="text-slate-400 underline cursor-pointer">Syarat & Ketentuan</span> kami.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badge */}
          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-1">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Transaksi 100% Aman</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Keamanan data dan kenyamanan transaksi Anda adalah prioritas utama kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
