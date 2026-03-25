import React from "react";
import { AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLogsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Error Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Pantau kegagalan integrasi API atau sistem secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
            <RefreshCw size={16} /> Segarkan
          </button>
          <button className="bg-red-600/10 hover:bg-red-600/20 text-red-500 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-red-500/20 transition-all">
            <Trash2 size={18} /> Bersihkan Log
          </button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Pesan Error</th>
                  <th className="px-6 py-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {/* Empty */}
              </tbody>
            </table>
          </div>
          <div className="p-12 text-center">
            <AlertCircle size={40} className="text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 text-sm italic">Sistem berjalan normal. Tidak ada error log saat ini.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
