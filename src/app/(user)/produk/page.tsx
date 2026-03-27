import { Search, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import GameGrid from "@/components/home/GameGrid";
import { getCategories } from "@/lib/actions/category";

export default async function ProdukPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8">
      <div className="container mx-auto px-6 md:px-10 lg:px-12">
        {/* Header Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">Semua Produk</h1>
            <p className="text-sm text-slate-400">Pilih game favorit Anda dan top up sekarang dengan harga termurah.</p>
          </div>
          <div className="w-full md:w-96">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Cari nama game..."
                className="w-full bg-slate-950 border-slate-800 text-slate-200 pl-12 h-14 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Reuse the GameGrid component but without the popular section if possible, 
            or just render it as is for now */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-8 border-l-4 border-blue-600 pl-4 bg-blue-600/5 py-2 rounded-r-xl w-fit">
            <Gamepad2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Katalog Lengkap</h2>
          </div>
          
          {/* We will reuse GameGrid component here since it already has the tabs and games */}
          <div className="-mt-12">
            <GameGrid categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
