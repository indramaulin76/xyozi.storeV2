"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock, Loader2, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      title="Klik untuk menyalin"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-emerald-400" />
      )}
      <span className="text-emerald-300 font-mono text-sm font-black">{text}</span>
      {copied && <span className="text-[10px] text-emerald-400 ml-1">Disalin!</span>}
    </button>
  );
}

function InvoiceDisplay({ referenceId }: { referenceId: string }) {
  return (
    <div className="inline-block bg-emerald-500/20 px-4 py-2 rounded-lg">
      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">NO. INVOICE</p>
      <CopyButton text={referenceId} />
    </div>
  );
}

interface OrderData {
  id: string;
  referenceId: string;
  paymentStatus: string;
  digiflazzStatus: string;
  serialNumber?: string | null;
  product?: {
    name: string;
  };
  userGameId: string;
}

export function TransactionStatus({ initialOrder }: { initialOrder: OrderData }) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (order.digiflazzStatus === "SUCCESS" || order.digiflazzStatus === "FAILED" || order.paymentStatus === "EXPIRED") {
      return;
    }

    const pollStatus = async () => {
      setIsPolling(true);
      try {
        const response = await fetch(`/api/order/${order.referenceId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        setIsPolling(false);
      }
    };

    const interval = setInterval(pollStatus, 10000);
    return () => clearInterval(interval);
  }, [order.referenceId, order.digiflazzStatus, order.paymentStatus]);

  if (order.paymentStatus === "PENDING") {
    return (
      <Card className="bg-blue-500/10 rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="text-lg font-black text-blue-400 uppercase tracking-tight mb-2">
            Menunggu Pembayaran
          </h3>
          <p className="text-slate-400 text-sm">
            Silakan selesaikan pembayaran agar pesanan dapat diproses.
          </p>
          <div className="mt-4">
            <InvoiceDisplay referenceId={order.referenceId} />
          </div>
          {isPolling && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Memperbarui...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (order.paymentStatus === "LUNAS" && order.digiflazzStatus === "PROCESSING") {
    return (
      <Card className="bg-amber-500/10 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
          </div>
          <h3 className="text-lg font-black text-amber-400 uppercase tracking-tight mb-2">
            Pesanan Sedang Dikirim
          </h3>
          <p className="text-slate-400 text-sm">
            Pembayaran berhasil! Item sedang dikirim ke akun {order.userGameId}...
          </p>
          <div className="mt-4">
            <InvoiceDisplay referenceId={order.referenceId} />
          </div>
          {isPolling && (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Memperbarui...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (order.paymentStatus === "LUNAS" && order.digiflazzStatus === "SUCCESS") {
    return (
      <Card className="bg-emerald-500/10 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30">
        <CardContent className="p-6 text-center">
          <div className="relative inline-flex mb-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-2">
            Pembayaran Berhasil & Diamond Terkirim!
          </h3>
          <p className="text-slate-400 text-sm mb-3">
            Item {order.product?.name || 'pesanan'} sudah masuk ke akun {order.userGameId}.
          </p>
          <InvoiceDisplay referenceId={order.referenceId} />
        </CardContent>
      </Card>
    );
  }

  if (order.paymentStatus === "EXPIRED") {
    return (
      <Card className="bg-red-500/10 rounded-3xl overflow-hidden shadow-2xl border border-red-500/30">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-red-400 uppercase tracking-tight mb-2">
            Pembayaran Kadaluarsa
          </h3>
          <p className="text-slate-400 text-sm">
            Waktu pembayaran telah habis. Silakan buat pesanan baru.
          </p>
          <div className="mt-4">
            <InvoiceDisplay referenceId={order.referenceId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (order.digiflazzStatus === "FAILED") {
    return (
      <Card className="bg-red-500/10 rounded-3xl overflow-hidden shadow-2xl border border-red-500/30">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-red-400 uppercase tracking-tight mb-2">
            Pengiriman Gagal
          </h3>
          <p className="text-slate-400 text-sm">
            Terjadi kendala. Saldo Anda aman, silakan hubungi CS untuk refund atau proses ulang.
          </p>
          <div className="mt-4">
            <InvoiceDisplay referenceId={order.referenceId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
