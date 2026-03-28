import React from "react";
import { Search, Filter, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";

// Server component untuk page pesanan
export default async function AdminPesananPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  });

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
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">User ID</th>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4">Harga</th>
                    <th className="px-6 py-4">Status Pembayaran</th>
                    <th className="px-6 py-4">Status Digiflazz</th>
                    <th className="px-6 py-4">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-yellow-500">{order.referenceId}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {order.userGameId} {order.zoneId && `(${order.zoneId})`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.product?.name || 'Produk Terhapus'}</div>
                        <div className="text-xs text-slate-500">{order.product?.category?.name || "Tanpa Kategori"}</div>
                      </td>
                      <td className="px-6 py-4 text-white font-bold">
                        {formatRupiah(order.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.digiflazzStatus} type="digiflazz" />
                        {order.serialNumber && (
                          <div className="text-[10px] text-slate-500 mt-1">SN: {order.serialNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm italic">Belum ada pesanan yang masuk.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status, type }: { status: string, type: 'payment' | 'digiflazz' }) {
  if (status === 'SUCCESS' || status === 'LUNAS' || status === 'berhasil') {
    return <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg uppercase">{status}</span>;
  }
  if (status === 'PROCESSING') {
    return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg uppercase">{status}</span>;
  }
  if (status === 'FAILED' || status === 'EXPIRED') {
    return <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg uppercase">{status}</span>;
  }
  if (status === 'PENDING') {
    return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-lg uppercase">{status}</span>;
  }
  return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 text-xs font-bold rounded-lg uppercase">{status}</span>;
}
