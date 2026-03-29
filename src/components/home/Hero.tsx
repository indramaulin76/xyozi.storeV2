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
import { getWebsiteSettings } from "@/lib/actions/settings";

async function getHeroBanner() {
  try {
    const settings = await getWebsiteSettings();
    return settings.heroBanner;
  } catch (error) {
    console.error("Error fetching hero banner:", error);
    return null;
  }
}

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&h=500&auto=format&fit=crop";

interface HeroProps {
  heroBanner?: string | null;
}

export default function Hero({ heroBanner }: HeroProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const bannerImage = heroBanner || DEFAULT_BANNER;

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <Carousel 
        plugins={[plugin.current]}
        className="w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shadow-black/50"
      >
        <CarouselContent>
          <CarouselItem>
            <div className="relative aspect-[3.2/1] w-full min-h-[180px] md:min-h-[300px] lg:min-h-[400px]">
              <Image
                src={bannerImage}
                alt="Hero Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          </CarouselItem>
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-6 bg-slate-900/80 border border-slate-700 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500" />
          <CarouselNext className="right-6 bg-slate-900/80 border border-slate-700 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500" />
        </div>
      </Carousel>
    </section>
  );
}
