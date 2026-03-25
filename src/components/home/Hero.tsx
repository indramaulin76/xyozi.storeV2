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
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&h=400&auto=format&fit=crop",
    title: "Promo Diamond MLBB",
    subtitle: "Diskon hingga 30% hari ini!",
  },
];

export default function Hero() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="container mx-auto px-4 py-4 md:py-6">
      <Carousel 
        plugins={[plugin.current]}
        className="w-full overflow-hidden rounded-xl md:rounded-2xl border border-slate-800 shadow-2xl"
      >
        <CarouselContent>
          {BANNERS.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative aspect-[2/1] md:aspect-[3/1] w-full min-h-[160px] md:min-h-[250px]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover brightness-[0.4]"
                  priority
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-left">
                  <div className="max-w-xl">
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
                      {banner.title.split(" ").map((word, i) => (
                        <span key={i} className={i === 2 ? "text-blue-500" : ""}>
                          {word}{" "}
                        </span>
                      ))}
                    </h2>
                    <p className="mt-1 text-[8px] text-slate-300 sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] opacity-80">
                      {banner.subtitle}
                    </p>
                    <button className="mt-3 md:mt-6 bg-blue-600 hover:bg-blue-700 text-white text-[10px] md:text-xs font-bold py-1.5 px-4 md:py-2.5 md:px-6 rounded-lg transition-all active:scale-95">
                      Top Up Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-6 bg-black/40 border-slate-700 text-white hover:bg-blue-600" />
          <CarouselNext className="right-6 bg-black/40 border-slate-700 text-white hover:bg-blue-600" />
        </div>
      </Carousel>
    </section>
  );
}
