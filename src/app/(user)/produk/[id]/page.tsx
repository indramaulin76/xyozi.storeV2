import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import OrderForm from "@/components/product/OrderForm";
import { getCategoryBySlug } from "@/lib/actions/category";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const category = await getCategoryBySlug(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80" 
          alt="Game Banner" 
          fill 
          className="object-cover brightness-[0.3] blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl shrink-0 bg-slate-800">
              {category.logoUrl ? (
                <Image 
                  src={category.logoUrl} 
                  alt={category.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-blue-500">
                  {category.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-center md:text-left space-y-2 pb-2">
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">{category.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge className="bg-blue-600 text-white border-none">Proses Otomatis</Badge>
                <Badge variant="outline" className="text-slate-400 border-slate-800">24 Jam Nonstop</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <OrderForm category={category as any} />
      </div>
    </div>
  );
}
