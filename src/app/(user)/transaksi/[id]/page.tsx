import React from "react";
import { getOrderByReference } from "@/lib/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, QrCode, CreditCard, Copy, ArrowLeft, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { getPaymentMethod, formatPaymentGuide } from "@/lib/payment-methods";
import { PaymentStatusClient } from "./PaymentStatusClient";
import { TransactionStatus } from "./TransactionStatus";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderByReference(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Pesanan Tidak Ditemukan</h1>
          <p className="text-slate-400">Nomor invoice <span className="text-blue-400 font-mono font-bold">{id}</span> tidak valid atau telah kadaluarsa.</p>
          <Link 
            href="/transaksi"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-2xl transition-all border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali Cek Transaksi
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethodInfo = order.paymentMethod ? getPaymentMethod(order.paymentMethod) : null;
  const totalPayment = order.amount + (order.paymentFee || 0);
  const paymentGuide = order.paymentMethod ? formatPaymentGuide(order.paymentMethod) : '';

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-3 py-1 rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Berhasil</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 px-3 py-1 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran</Badge>;
      case "EXPIRED":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 px-3 py-1 rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Kadaluarsa</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 px-3 py-1 rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Gagal</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50 px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">Detail Transaksi</h1>
            <p className="text-slate-400 font-mono text-sm tracking-widest">{order.referenceId}</p>
          </div>
          <div className="flex items-center gap-3">
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-slate-800/50 bg-slate-900/50 p-6">
                <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-slate-400">Game</div>
                  <div className="text-white font-bold text-right">{order.product.category?.name || "Lainnya"}</div>
                  
                  <div className="text-slate-400">Produk</div>
                  <div className="text-white font-bold text-right">{order.product.name}</div>
                  
                  <div className="text-slate-400">Target ID</div>
                  <div className="text-white font-bold text-right font-mono">
                    {order.userGameId} {order.zoneId ? `(${order.zoneId})` : ""}
                  </div>

                  <div className="text-slate-400">Metode Pembayaran</div>
                  <div className="text-white font-bold text-right">
                    {paymentMethodInfo?.name || order.paymentMethod || "-"}
                  </div>

                  <div className="col-span-2 border-t border-slate-800 my-2"></div>

                  <div className="text-slate-400">Harga Layanan</div>
                  <div className="text-white font-bold text-right">Rp {order.amount.toLocaleString("id-ID")}</div>
                  
                  <div className="text-slate-400">Biaya Admin</div>
                  <div className="text-white font-bold text-right">Rp {(order.paymentFee || 0).toLocaleString("id-ID")}</div>

                  <div className="col-span-2 bg-blue-600/10 p-4 rounded-2xl mt-4 flex justify-between items-center border border-blue-500/20">
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Total Bayar</span>
                    <span className="text-2xl font-black text-white">Rp {totalPayment.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card - Auto Refresh */}
            <TransactionStatus initialOrder={order} />

            {/* Payment Instructions */}
            {order.paymentStatus === "PENDING" && paymentGuide && (
              <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/50 p-6">
                  <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Cara Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <pre className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed font-mono">
                    {paymentGuide}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Panel */}
          <div className="space-y-6">
            {/* Countdown Timer & Payment Info */}
            {order.paymentStatus === "PENDING" && order.expiredAt && (
              <PaymentStatusClient 
                expiredAt={order.expiredAt.toISOString()}
                paymentMethod={order.paymentMethod || "QRIS"}
                paymentQrCode={order.paymentQrCode}
                paymentNo={order.paymentNo}
                checkoutUrl={order.checkoutUrl}
                totalPayment={totalPayment}
              />
            )}

            {/* Need Help */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Butuh Bantuan?
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Jika Anda mengalami kendala pembayaran atau pesanan belum masuk dalam 10 menit, hubungi CS kami.
              </p>
              <Link 
                href="https://wa.me/your-number" 
                target="_blank"
                className="block text-center w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                WhatsApp Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
