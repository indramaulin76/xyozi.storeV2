import React from "react";
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  History,
  Package,
  Layers
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats, getRecentOrders, checkSystemStatus } from "@/lib/actions/dashboard";
import { formatRupiah, formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, recentOrders, systemStatus] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    checkSystemStatus()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Selamat datang kembali, Admin.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendapatan" 
          value={formatRupiah(stats.totalRevenue)} 
          icon={<CreditCard className="text-yellow-500" />} 
          trend={`${stats.successOrders} transaksi`}
        />
        <StatCard 
          title="Pesanan Sukses" 
          value={stats.successOrders.toString()} 
          icon={<ShoppingBag className="text-green-500" />} 
          trend="+diterima"
          up 
        />
        <StatCard 
          title="Pesanan Pending" 
          value={stats.pendingOrders.toString()} 
          icon={<Activity className="text-yellow-500" />} 
          trend="menunggu"
        />
        <StatCard 
          title="Total Produk" 
          value={stats.totalProducts.toString()} 
          icon={<Package className="text-purple-500" />} 
          trend={`${stats.totalCategories} kategori`}
          up 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <History size={18} className="text-yellow-500" /> Transaksi Terbaru
            </h3>
            <a href="/admin/pesanan" className="text-xs font-bold text-yellow-500 hover:text-yellow-400 uppercase">Lihat Semua</a>
          </div>
          <CardContent className="p-0">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4">Invoice</th>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-yellow-500">{order.referenceId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{order.product.name}</div>
                          <div className="text-xs text-slate-500">{order.product.category.name}</div>
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          {formatRupiah(order.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge payment={order.paymentStatus} digiflazz={order.digiflazzStatus} />
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm italic">Belum ada data transaksi yang tersedia.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Status Sistem</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            <StatusItem label="Database MySQL" status={systemStatus.database.status} color={systemStatus.database.color} />
            <StatusItem label="API Digiflazz" status={systemStatus.digiflazz.status} color={systemStatus.digiflazz.color} />
            <StatusItem label="API Sukurupiah" status={systemStatus.sukurupiah.status} color={systemStatus.sukurupiah.color} />
            <StatusItem label="Server Mode" status={systemStatus.serverMode.status} color={systemStatus.serverMode.color} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, up }: { title: string, value: string, icon: React.ReactNode, trend: string, up?: boolean }) {
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${up ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <h4 className="text-2xl font-black text-white mt-1">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
      <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{status}</span>
    </div>
  );
}

function StatusBadge({ payment, digiflazz }: { payment: string, digiflazz: string }) {
  if (payment === 'LUNAS' && digiflazz === 'SUCCESS') {
    return <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg">Sukses</span>;
  }
  if (payment === 'LUNAS' && digiflazz === 'PROCESSING') {
    return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg">Proses</span>;
  }
  if (payment === 'LUNAS' && digiflazz === 'FAILED') {
    return <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg">Gagal</span>;
  }
  if (payment === 'PENDING') {
    return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-lg">Pending</span>;
  }
  if (payment === 'EXPIRED') {
    return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 text-xs font-bold rounded-lg">Expired</span>;
  }
  return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 text-xs font-bold rounded-lg">{payment}</span>;
}
