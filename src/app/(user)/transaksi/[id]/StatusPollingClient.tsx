"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderData {
  id: string;
  referenceId: string;
  digiflazzStatus: string;
  paymentStatus: string;
  product: {
    name: string;
    category?: {
      name: string;
    } | null;
  };
  userGameId: string;
  serialNumber?: string | null;
  amount: number;
}

interface StatusPollingClientProps {
  initialOrder: OrderData;
}

export function StatusPollingClient({ initialOrder }: StatusPollingClientProps) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Stop polling if we reached a final state
    if (order.digiflazzStatus === "SUCCESS" || order.digiflazzStatus === "FAILED" || order.paymentStatus === "EXPIRED") {
      return;
    }

    const pollStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/order/${order.referenceId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [order.referenceId, order.digiflazzStatus, order.paymentStatus]);

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/50 p-6">
        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Status Pengiriman
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* SUCCESS STATE */}
        {order.digiflazzStatus === "SUCCESS" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30 opacity-20"></div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-1">
                Pesanan Selesai Dikirim
              </h3>
              <p className="text-emerald-300/80 text-sm font-medium">
                Item telah berhasil masuk ke akun Anda. Terima Kasih!
              </p>
              {order.serialNumber && (
                <div className="inline-block bg-emerald-500/20 px-3 py-1.5 rounded-lg mt-3">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mb-0.5">SN / KODE VOUCHER</p>
                  <p className="text-emerald-300 font-mono text-xs font-black leading-none">{order.serialNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROCESSING STATE (LUNAS tapi Webhook belum tembus / digiflazz processing) */}
        {(order.digiflazzStatus === "PENDING" || order.digiflazzStatus === "PROCESSING") && order.paymentStatus === "LUNAS" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-tight mb-1">
                Pesanan Sedang Dikirim
              </h3>
              <p className="text-amber-300/80 text-sm font-medium">
                Sistem kami sedang memproses pengiriman otomatis ke akun Anda. Mohon tunggu beberapa saat.
              </p>
              <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-amber-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest">Auto-refresh aktif...</span>
              </div>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {order.digiflazzStatus === "FAILED" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black text-red-400 uppercase tracking-tight mb-1">
                Pengiriman Gagal
              </h3>
              <p className="text-red-300/80 text-sm font-medium">
                Terjadi kendala saat pengiriman item oleh provider. Saldo/Dana Anda aman, silakan hubungi CS untuk refund atau proses ulang.
              </p>
            </div>
          </div>
        )}

        {/* WAITING PAYMENT STATE */}
        {order.paymentStatus === "PENDING" && (order.digiflazzStatus === "PENDING" || order.digiflazzStatus === "PROCESSING") && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black text-blue-400 uppercase tracking-tight mb-1">
                Menunggu Pembayaran
              </h3>
              <p className="text-blue-300/80 text-sm font-medium">
                Silakan selesaikan pembayaran agar pesanan Anda dapat segera kami kirim otomatis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
