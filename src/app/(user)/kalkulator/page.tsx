"use client";

import React from "react";
import { Calculator, Sparkles, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function KalkulatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            Kalkulator Game
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Hitung perkiraan diamond yang Anda butuhkan untuk mendapatkan skin impian Anda di Mobile Legends.
          </p>
        </div>

        <Tabs defaultValue="magic-wheel" className="w-full">
          <TabsList className="flex w-full bg-slate-900 border border-slate-800 p-1 mb-8 rounded-xl">
            <TabsTrigger value="magic-wheel" className="flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Magic Wheel
            </TabsTrigger>
            <TabsTrigger value="zodiac" className="flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Zodiac Summon
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="magic-wheel">
            <CalculatorCard 
              title="Kalkulator Magic Wheel"
              icon={<Sparkles className="w-5 h-5 text-purple-500" />}
              description="Hitung total diamond yang dibutuhkan untuk mencapai 200 poin Magic Core."
              inputLabel="Poin Magic Core Saat Ini"
              maxPoint={200}
              pricePerSpin={60}
              pointsPerSpin={1}
            />
          </TabsContent>

          <TabsContent value="zodiac">
            <CalculatorCard 
              title="Kalkulator Zodiac"
              icon={<Target className="w-5 h-5 text-blue-500" />}
              description="Hitung total diamond yang dibutuhkan untuk mencapai 100 poin Star Power."
              inputLabel="Star Power Saat Ini"
              maxPoint={100}
              pricePerSpin={20}
              pointsPerSpin={1}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CalculatorCard({ 
  title, description, inputLabel, maxPoint, pricePerSpin, pointsPerSpin, icon
}: { 
  title: string, description: string, inputLabel: string, maxPoint: number, pricePerSpin: number, pointsPerSpin: number, icon: React.ReactNode 
}) {
  const [currentPoints, setCurrentPoints] = React.useState<string>("");
  
  const pointsNeeded = Math.max(0, maxPoint - (parseInt(currentPoints) || 0));
  const spinsNeeded = Math.ceil(pointsNeeded / pointsPerSpin);
  const diamondNeeded = spinsNeeded * pricePerSpin;

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="text-xl font-bold text-white uppercase">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-8">{description}</p>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">{inputLabel}</label>
            <Input 
              type="number"
              min="0"
              max={maxPoint}
              value={currentPoints}
              onChange={(e) => setCurrentPoints(e.target.value)}
              placeholder={`Contoh: 120 (Max ${maxPoint})`}
              className="bg-slate-950 border-slate-800 h-14 rounded-2xl text-white text-lg px-4 focus:ring-yellow-500"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-400 uppercase">Sisa Poin / Spin</span>
              <span className="text-lg font-black text-white">{pointsNeeded} Poin / {spinsNeeded}x Spin</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-slate-400 uppercase">Estimasi Diamond</span>
              <div className="flex items-center gap-2">
                <img src="https://cdn1.codashop.com/S/content/common/images/mno/mlbb_gem.png" className="w-5 h-5" alt="diamond" />
                <span className="text-2xl md:text-3xl font-black text-yellow-500">{diamondNeeded.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
