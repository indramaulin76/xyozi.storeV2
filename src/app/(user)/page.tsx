import Hero from "@/components/home/Hero";
import FlashSale from "@/components/home/FlashSale";
import PopularProducts from "@/components/home/PopularProducts";
import GameGrid from "@/components/home/GameGrid";
import { getCategories } from "@/lib/actions/category";
import { getFlashSaleProducts } from "@/lib/actions/product";
import { getFlashSaleSettings, getWebsiteSettings } from "@/lib/actions/settings";
import { getPopularProducts } from "@/lib/actions/product";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [categories, flashSaleProducts, flashSaleSettings, popularProducts, websiteSettings] = await Promise.all([
    getCategories(),
    getFlashSaleProducts(),
    getFlashSaleSettings(),
    getPopularProducts(8),
    getWebsiteSettings()
  ]);

  console.log("--- DATA DATABASE ---");
  console.log("categories:", categories);
  console.log("categories.length:", categories?.length);
  console.log("flashSaleProducts:", flashSaleProducts?.length);
  console.log("popularProducts:", popularProducts?.length);

  console.log("=== PASSING TO COMPONENTS ===");
  console.log("categories:", categories?.length);
  console.log("flashSaleProducts:", flashSaleProducts?.length);
  console.log("popularProducts:", popularProducts?.length);

  return (
    <div className="pb-20">
      <Hero heroBanner={websiteSettings?.heroBanner} />
      <FlashSale products={flashSaleProducts || []} endTime={flashSaleSettings?.endTime} />
      <PopularProducts initialProducts={popularProducts || []} />
      <GameGrid categories={categories || []} />
    </div>
  );
}
