import Featured from "@/components/Featured";
import GameProductsSection from "@/components/GameProductsSection";
import Guide from "@/components/Guide";
import HeroSection from "@/components/HeroSection";
import Reviews from "@/components/Reviews";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Featured />
      <GameProductsSection />
      <Guide />
      <Reviews />
    </>
  );
}
