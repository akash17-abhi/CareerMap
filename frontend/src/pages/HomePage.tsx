import HeroSection from "@/components/home/HeroSection";
import CareerJourneySection from "@/components/home/CareerJourneySection";
import FeatureSection from "@/components/home/FeatureSection";
import PrivacySection from "@/components/home/PrivacySection";

export default function HomePage() {
  return (
    <main className="min-w-0 overflow-x-clip bg-white">
      <HeroSection />

      <CareerJourneySection />

      <FeatureSection />

      <PrivacySection />
    </main>
  );
}