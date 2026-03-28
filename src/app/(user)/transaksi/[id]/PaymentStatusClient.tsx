"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Copy, ExternalLink } from "lucide-react";
import { getPaymentMethod } from "@/lib/payment-methods";

interface PaymentStatusClientProps {
  expiredAt: string;
  paymentMethod: string;
  paymentQrCode?: string | null;
  paymentNo?: string | null;
  checkoutUrl?: string | null;
  totalPayment: number;
}

export function PaymentStatusClient({
  expiredAt,
  paymentMethod,
  paymentQrCode,
  paymentNo,
  checkoutUrl,
  totalPayment,
}: PaymentStatusClientProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const paymentInfo = getPaymentMethod(paymentMethod);
  const isEWallet = paymentInfo?.type === "REDIRECT";
  const isQRIS = paymentMethod.startsWith("QRIS");
  const isVA = paymentMethod.includes("VA");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expired = new Date(expiredAt).getTime();
      const distance = expired - now;

      if (distance < 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [expiredAt]);

  const handleCopy = async () => {
    if (paymentNo) {
      await navigator.clipboard.writeText(paymentNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (timeLeft === "EXPIRED") {
    return (
      <Card className="bg-red-500/10 rounded-3xl overflow-hidden shadow-2xl border border-red-500/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-black text-red-500">!</span>
          </div>
          <h3 className="text-xl font-black text-red-400 uppercase tracking-tight mb-2">
            Waktu Habis
          </h3>
          <p className="text-slate-400 text-sm">
            Silakan buat pesanan baru.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-3xl overflow-hidden shadow-2xl border-none">
      <CardHeader className="bg-blue-600 text-white p-6">
        <CardTitle className="text-center font-black uppercase tracking-widest text-sm">
          {isEWallet ? "Pembayaran E-Wallet" : isVA ? "Virtual Account" : "QRIS"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center">
        {/* Countdown Timer */}
        <div className="w-full bg-slate-100 rounded-2xl p-4 mb-6 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
            Sisa Waktu Pembayaran
          </p>
          <p className="text-3xl font-black text-blue-600 font-mono">{timeLeft}</p>
        </div>

        {/* QRIS Image or Sandbox Link */}
        {isQRIS && (
          <div className="w-full flex flex-col items-center mb-6">
            {paymentQrCode && paymentQrCode !== "true" ? (
              <div className="bg-slate-100 p-4 rounded-3xl mb-4">
                <img
                  src={paymentQrCode}
                  alt="QRIS Payment"
                  className="w-48 h-48 object-contain"
                />
              </div>
            ) : checkoutUrl ? (
              <div className="w-full space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                  <QrCode className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-tight">QRIS Ready</p>
                  <p className="text-[10px] text-blue-600 mt-1">Klik tombol di bawah untuk melihat kode QR dan bayar.</p>
                </div>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  <ExternalLink className="w-5 h-5" />
                  Tampilkan QRIS / Bayar
                </a>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-100 rounded-2xl w-full">
                <p className="text-xs text-slate-500 italic">Sedang memproses kode pembayaran...</p>
              </div>
            )}
          </div>
        )}

        {/* Virtual Account Number */}
        {isVA && paymentNo && (
          <div className="w-full mb-6 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
              Nomor Virtual Account
            </p>
            <div className="bg-slate-100 p-4 rounded-2xl">
              <p className="text-2xl font-black font-mono text-slate-900 tracking-wider">
                {paymentNo}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-600 uppercase">
                {copied ? "Tersalin!" : "Salin Nomor"}
              </span>
            </button>
          </div>
        )}

        {/* E-Wallet Redirect Button */}
        {isEWallet && checkoutUrl && (
          <div className="w-full mb-6">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Buka Aplikasi {paymentInfo?.name}
            </a>
          </div>
        )}

        {/* Amount */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Bayar</span>
            <span className="text-lg font-black text-slate-900">
              Rp {totalPayment.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
          {isQRIS && "Scan QRIS untuk pembayaran"}
          {isVA && "Transfer ke nomor Virtual Account di atas"}
          {isEWallet && "Klik tombol di atas untuk membuka aplikasi"}
        </p>
      </CardContent>
    </Card>
  );
}
