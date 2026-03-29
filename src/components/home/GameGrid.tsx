"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Gamepad2, Ticket, Smartphone, Zap, Wifi, Star } from "lucide-react";
import { useState, useMemo, useRef } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  menuSection: string;
}

interface GameGridProps {
  categories: Category[];
}

const MENU_SECTIONS = [
  { key: "topup", label: "Top Up", icon: Gamepad2 },
  { key: "voucher", label: "Voucher Game", icon: Ticket },
  { key: "pulsa", label: "Pulsa", icon: Smartphone },
  { key: "token", label: "Token Listrik", icon: Zap },
  { key: "data", label: "Paket Data", icon: Wifi },
];

const SECTION_TITLES: Record<string, string> = {
  topup: "Top Up Game",
  voucher: "Voucher Game",
  pulsa: "Pulsa & Kuota",
  token: "Token Listrik",
  data: "Paket Data",
};

export default function GameGrid({ categories }: GameGridProps) {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("topup");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  if (!categories || categories.length === 0) {
    return null;
  }

  const availableSections = useMemo(() => {
    const sectionsWithCategories = new Set(categories.map(c => c.menuSection));
    return MENU_SECTIONS.filter(section => sectionsWithCategories.has(section.key));
  }, [categories]);

  const categoriesBySection = useMemo(() => {
    const query = search.toLowerCase();
    const bySection: Record<string, Category[]> = {};

    for (const section of availableSections) {
      bySection[section.key] = categories.filter(
        (cat) => cat.menuSection === section.key && cat.name.toLowerCase().includes(query)
      );
    }

    return bySection;
  }, [categories, availableSections, search]);

  const scrollToSection = (sectionKey: string) => {
    const target = sectionRefs.current[sectionKey];
    if (!target) return;
    setActiveSection(sectionKey);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 bg-slate-900">
      <div className="w-full flex flex-col">
        <div className="w-full overflow-x-auto no-scrollbar mb-6 pb-2">
          <div className="flex w-max gap-3">
            {availableSections.map((section) => (
              <CategoryNavButton
                key={section.key}
                label={section.label}
                icon={<section.icon className="w-4 h-4" />}
                isActive={activeSection === section.key}
                onClick={() => scrollToSection(section.key)}
              />
            ))}
          </div>
        </div>

        <div className="block w-full mb-10">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Cari game atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 text-slate-200 pl-12 h-12 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
            />
          </div>
        </div>

        {availableSections.map((section) => (
          <div
            key={section.key}
            ref={(el) => {
              sectionRefs.current[section.key] = el;
            }}
            className="mt-0 outline-none block w-full scroll-mt-24"
            id={`section-${section.key}`}
          >
            <CategoryTitle title={SECTION_TITLES[section.key] || section.label} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {categoriesBySection[section.key]?.length === 0 ? (
                <p className="col-span-full text-center text-slate-500 py-12 italic">Tidak ada {section.label.toLowerCase()} ditemukan.</p>
              ) : (
                categoriesBySection[section.key].map((game) => (
                  <GameCard key={game.id} game={game} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryNavButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-full border px-6 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
        isActive
          ? "bg-yellow-500 text-black border-yellow-500"
          : "bg-slate-800 text-slate-400 border-slate-700 hover:border-yellow-500 hover:text-yellow-400"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function CategoryTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-8 border-l-4 border-yellow-500 pl-4 bg-yellow-500/5 py-2 rounded-r-xl">
      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
    </div>
  );
}

function GameCard({ game, index }: { game: Category, index?: number }) {
  return (
    <Link href={`/produk/${game.slug}`} className="group block w-full">
      <div className="flex flex-col items-center">
        <div className="relative aspect-square w-full rounded-2xl border-2 border-slate-700 bg-slate-800 group-hover:border-yellow-500 transition-all shadow-lg overflow-hidden">
          {game.logoUrl && game.logoUrl !== "" ? (
            <img 
              src={game.logoUrl} 
              alt={game.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full bg-yellow-500/10 flex items-center justify-center text-xl font-black text-yellow-500">
              {game.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          {index && (
            <div className="absolute bottom-2 left-2 h-6 w-6 bg-yellow-500 rounded-md flex items-center justify-center text-[10px] font-black text-black shadow-xl border border-yellow-400">
              {index}
            </div>
          )}
        </div>
        <div className="mt-3 text-center">
          <h4 className="text-[10px] md:text-sm font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase">
            {game.name}
          </h4>
          {index && <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">ID</p>}
        </div>
      </div>
    </Link>
  );
}
