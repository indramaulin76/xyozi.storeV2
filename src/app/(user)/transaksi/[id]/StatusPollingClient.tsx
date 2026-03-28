"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [isSuccess, setIsSuccess] = useState(false);

  const isPendingOrProcessing =
    order.digiflazzStatus === "PENDING" ||
    order.digiflazzStatus === "PROCESSING";

  useEffect(() => {
    if (order.digiflazzStatus === "SUCCESS") {
      setIsSuccess(true);
      return;
    }

    const pollStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/order/${order.referenceId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          if (data.digiflazzStatus === "SUCCESS") {
            setIsSuccess(true);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(pollStatus, 5000);

    return () => clearInterval(interval);
  }, [order.referenceId, order.digiflazzStatus]);

  if (isSuccess) {
    return (
      <Card className="bg-emerald-500/10 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 animate-in fade-in zoom-in duration-500">
        <CardContent className="p-8 text-center">
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30"></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight mb-2">
            Pembayaran Berhasil!
          </h3>
          <p className="text-emerald-300/80 text-sm font-medium mb-4">
            Diamond {order.product.name} sudah terkirim ke akun {order.userGameId}!
          </p>
          {order.serialNumber && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-4">
              <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest mb-1">
                Serial Number
              </p>
              <p className="text-emerald-400 font-mono text-sm font-bold">
                {order.serialNumber}
              </p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400/60">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Auto-refresh aktif</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-500/10 rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className={`w-6 h-6 text-blue-400 ${isLoading ? "animate-spin" : ""}`} />
        </div>
        <h3 className="text-lg font-black text-blue-400 uppercase tracking-tight mb-2">
          {order.digiflazzStatus === "PROCESSING" ? "Sedang Diproses" : "Menunggu Pembayaran"}
        </h3>
        <p className="text-slate-400 text-xs mb-4">
          {order.digiflazzStatus === "PROCESSING"
            ? "Pesananmu sedang diproses oleh sistem..."
            : "Status akan otomatis diperbarui setelah pembayaran diverifikasi."}
        </p>
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Memperbarui otomatis...</span>
        </div>
      </CardContent>
    </Card>
  );
}
