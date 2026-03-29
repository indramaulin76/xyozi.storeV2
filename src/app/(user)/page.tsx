import Hero from "@/components/home/Hero";
// import FlashSale from "@/components/home/FlashSale";
// import PopularProducts from "@/components/home/PopularProducts";
import GameGrid from "@/components/home/GameGrid";
import { getCategories } from "@/lib/actions/category";
// import { getFlashSaleProducts } from "@/lib/actions/product";
import { getWebsiteSettings } from "@/lib/actions/settings";
// import { getPopularProducts } from "@/lib/actions/product";
// import { getFlashSaleSettings } from "@/lib/actions/settings";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [categories, websiteSettings] = await Promise.all([
    getCategories(),
    getWebsiteSettings()
  ]);

  console.log("--- DATA DATABASE ---");
  console.log("categories:", categories);
  console.log("categories.length:", categories?.length);

  console.log("=== PASSING TO COMPONENTS ===");
  console.log("categories:", categories?.length);

  return (
    <div className="pb-20">
      <Hero heroBanner={websiteSettings?.heroBanner} />
      {/* <FlashSale products={flashSaleProducts || []} endTime={flashSaleSettings?.endTime} /> */}
      {/* <PopularProducts initialProducts={popularProducts || []} /> */}
      <GameGrid categories={categories || []} />
    </div>
  );
}
