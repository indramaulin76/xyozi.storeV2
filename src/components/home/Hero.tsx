"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

const BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&h=400&auto=format&fit=crop",
    title: "Layanan Top Up 24 Jam",
    subtitle: "Proses Detikan, Harga Termurah",
    highlight: "24 Jam",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&h=400&auto=format&fit=crop",
    title: "Promo Diamond MLBB",
    subtitle: "Diskon hingga 30% hari ini!",
    highlight: "Diamond",
  },
];

export default function Hero() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <Carousel 
        plugins={[plugin.current]}
        className="w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shadow-black/50"
      >
        <CarouselContent>
          {BANNERS.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative aspect-[2/1] md:aspect-[3/1] w-full min-h-[160px] md:min-h-[250px]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover brightness-[0.35]"
                  priority
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-left">
                  <div className="max-w-xl">
                    <h2 className="text-xl font-black text-white sm:text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
                      {banner.title.split(" ").map((word, i) => {
                        const isHighlight = word === banner.highlight || banner.title.includes(word) && i > 0;
                        return (
                          <span 
                            key={i} 
                            className={isHighlight ? "text-yellow-500" : ""}
                          >
                            {word}{" "}
                          </span>
                        );
                      })}
                    </h2>
                    <p className="mt-2 md:mt-3 text-[10px] text-slate-300 sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] opacity-80">
                      {banner.subtitle}
                    </p>
                    <button className="mt-4 md:mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[10px] md:text-sm py-2 px-5 md:py-3 md:px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-500/30">
                      Top Up Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-6 bg-slate-900/80 border border-slate-700 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500" />
          <CarouselNext className="right-6 bg-slate-900/80 border border-slate-700 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500" />
        </div>
      </Carousel>
    </section>
  );
}
