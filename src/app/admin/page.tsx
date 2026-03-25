import React from "react";
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Selamat datang kembali, Admin.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pendapatan" value="Rp 0" icon={<CreditCard className="text-blue-500" />} trend="+0%" up />
        <StatCard title="Pesanan Sukses" value="0" icon={<ShoppingBag className="text-green-500" />} trend="+0%" up />
        <StatCard title="Pesanan Pending" value="0" icon={<Activity className="text-yellow-500" />} trend="0%" />
        <StatCard title="Total Pelanggan" value="0" icon={<Users className="text-purple-500" />} trend="+0%" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Placeholder */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <History size={18} className="text-blue-500" /> Transaksi Terbaru
            </h3>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase">Lihat Semua</button>
          </div>
          <CardContent className="p-0">
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm italic">Belum ada data transaksi yang tersedia.</p>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Status Sistem</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            <StatusItem label="API Digiflazz" status="Connected" color="text-green-500" />
            <StatusItem label="API Sukurupiah" status="Connected" color="text-green-500" />
            <StatusItem label="Database MySQL" status="Active" color="text-green-500" />
            <StatusItem label="Server Mode" status="Production" color="text-blue-500" />
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
