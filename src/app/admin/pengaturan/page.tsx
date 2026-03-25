"use client";

import React from "react";
import { Save, Shield, CreditCard, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPengaturanPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-400 mt-1">Konfigurasikan API Key dan identitas toko Anda.</p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 mb-8 rounded-xl w-fit">
          <TabsTrigger value="api" className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-blue-600">API Connection</TabsTrigger>
          <TabsTrigger value="toko" className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-blue-600">Identitas Toko</TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Digiflazz */}
            <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <Shield className="text-blue-500" size={20} />
                <h3 className="font-bold text-white text-sm uppercase">Digiflazz Configuration</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <Input className="bg-slate-950 border-slate-800 rounded-xl" placeholder="Username Digiflazz" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Production API Key</label>
                  <Input type="password" className="bg-slate-950 border-slate-800 rounded-xl" placeholder="••••••••••••" />
                </div>
              </CardContent>
            </Card>

            {/* Sukurupiah */}
            <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
                <CreditCard className="text-green-500" size={20} />
                <h3 className="font-bold text-white text-sm uppercase">Sukurupiah Configuration</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Merchant ID</label>
                  <Input className="bg-slate-950 border-slate-800 rounded-xl" placeholder="Merchant ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secret Key</label>
                  <Input type="password" className="bg-slate-950 border-slate-800 rounded-xl" placeholder="••••••••••••" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="toko">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl max-w-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
              <Monitor className="text-purple-500" size={20} />
              <h3 className="font-bold text-white text-sm uppercase">Website Info</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Toko</label>
                <Input className="bg-slate-950 border-slate-800 rounded-xl" placeholder="Xyozi Store" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Slogan</label>
                <Input className="bg-slate-950 border-slate-800 rounded-xl" placeholder="Top Up Game Termurah" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
          <Save size={18} /> Simpan Semua Perubahan
        </button>
      </div>
    </div>
  );
}
