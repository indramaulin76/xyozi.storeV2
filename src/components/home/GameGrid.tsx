"use client";

import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Gamepad2, Ticket, Smartphone, Zap, Wifi, Star } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface GameGridProps {
  categories: Category[];
}

export default function GameGrid({ categories }: GameGridProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Ambil 8 kategori pertama untuk section populer (sementara)
  const popularGames = categories.slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 bg-slate-950">
      {/* 1. PRODUK POPULER */}
      {popularGames.length > 0 && (
        <div className="mb-14">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            Produk Populer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-4">
            {popularGames.map((game, index) => (
              <Link key={game.id} href={`/produk/${game.slug}`} className="group">
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-blue-500 transition-all shadow-lg">
                    {game.logoUrl ? (
                      <Image src={game.logoUrl} alt={game.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300 p-1" />
                    ) : (
                      <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-xl font-black text-blue-500">
                        {game.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 h-6 w-6 bg-blue-600 rounded-md flex items-center justify-center text-[10px] font-black text-white shadow-xl border border-white/10">
                      {index + 1}
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h4 className="text-[10px] md:text-xs font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {game.name}
                    </h4>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">ID</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. CATEGORIES SECTION */}
      <Tabs defaultValue="topup" className="w-full flex flex-col">
        <div className="w-full overflow-x-auto no-scrollbar mb-6 pb-2">
          <TabsList className="flex w-max bg-transparent h-auto p-0 gap-3">
            <CategoryTab value="topup" label="Top Up" icon={<Gamepad2 className="w-4 h-4" />} />
            <CategoryTab value="voucher" label="Voucher Game" icon={<Ticket className="w-4 h-4" />} />
            <CategoryTab value="pulsa" label="Pulsa" icon={<Smartphone className="w-4 h-4" />} />
            <CategoryTab value="token" label="Token Listrik" icon={<Zap className="w-4 h-4" />} />
            <CategoryTab value="data" label="Paket Data" icon={<Wifi className="w-4 h-4" />} />
          </TabsList>
        </div>

        <div className="block w-full mb-10">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Cari game atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border-slate-800 text-slate-200 pl-12 h-12 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <TabsContent value="topup" className="mt-0 outline-none block w-full">
          <CategoryTitle title="Top Up Game" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {filteredCategories.length === 0 ? (
              <p className="col-span-full text-center text-slate-500 py-12 italic">Tidak ada game ditemukan.</p>
            ) : (
              filteredCategories.map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="voucher" className="mt-0 outline-none block w-full">
          <CategoryTitle title="Voucher Game" />
          <div className="flex items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
             <p className="text-slate-500 text-sm italic">Kategori ini belum tersedia.</p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function CategoryTab({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex items-center gap-2.5 rounded-full bg-slate-900 border border-slate-800 px-6 py-3 text-xs md:text-sm font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-500 transition-all whitespace-nowrap"
    >
      {icon} {label}
    </TabsTrigger>
  );
}

function CategoryTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-8 border-l-4 border-blue-600 pl-4 bg-blue-600/5 py-2 rounded-r-xl">
      <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
    </div>
  );
}

function GameCard({ game }: { game: Category }) {
  return (
    <Link href={`/produk/${game.slug}`} className="group block w-full">
      <div className="flex flex-col items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-blue-500 transition-all shadow-lg">
          {game.logoUrl ? (
            <Image src={game.logoUrl} alt={game.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300 p-1" />
          ) : (
            <div className="w-full h-full bg-blue-600/20 flex items-center justify-center text-xl font-black text-blue-500">
              {game.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="mt-3 text-center">
          <h4 className="text-[10px] md:text-sm font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors uppercase">
            {game.name}
          </h4>
        </div>
      </div>
    </Link>
  );
}

function CategoryTab({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex items-center gap-2.5 rounded-full bg-slate-900 border border-slate-800 px-6 py-3 text-xs md:text-sm font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-500 transition-all whitespace-nowrap"
    >
      {icon} {label}
    </TabsTrigger>
  );
}

function CategoryTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-8 border-l-4 border-blue-600 pl-4 bg-blue-600/5 py-2 rounded-r-xl">
      <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
    </div>
  );
}

function GameCard({ game }: { game: typeof CATEGORY_GAMES[0] }) {
  return (
    <Link href={`/produk/${game.id}`} className="group block w-full">
      <div className="flex flex-col items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-blue-500 transition-all shadow-lg">
          <Image src={game.image} alt={game.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300 p-1" />
        </div>
        <div className="mt-3 text-center">
          <h4 className="text-[10px] md:text-sm font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors uppercase">
            {game.name}
          </h4>
        </div>
      </div>
    </Link>
  );
}
