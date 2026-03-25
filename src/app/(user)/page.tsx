import Hero from "@/components/home/Hero";
import FlashSale from "@/components/home/FlashSale";
import GameGrid from "@/components/home/GameGrid";
import { getCategories } from "@/lib/actions/category";

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="pb-20">
      <Hero />
      <FlashSale />
      <GameGrid categories={categories} />
    </div>
  );
}
