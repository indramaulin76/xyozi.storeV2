import Hero from "@/components/home/Hero";
import FlashSale from "@/components/home/FlashSale";
import PopularProducts from "@/components/home/PopularProducts";
import GameGrid from "@/components/home/GameGrid";
import { getCategories } from "@/lib/actions/category";
import { getFlashSaleProducts } from "@/lib/actions/product";
import { getFlashSaleSettings, getWebsiteSettings } from "@/lib/actions/settings";
import { getPopularProducts } from "@/lib/actions/product";

export default async function Home() {
  const [categories, flashSaleProducts, flashSaleSettings, popularProducts, websiteSettings] = await Promise.all([
    getCategories(),
    getFlashSaleProducts(),
    getFlashSaleSettings(),
    getPopularProducts(8),
    getWebsiteSettings()
  ]);

  return (
    <div className="pb-20">
      <Hero heroBanner={websiteSettings.heroBanner} />
      <FlashSale products={flashSaleProducts} endTime={flashSaleSettings.endTime} />
      <PopularProducts initialProducts={popularProducts} />
      <GameGrid categories={categories} />
    </div>
  );
}
