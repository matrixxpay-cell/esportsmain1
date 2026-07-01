import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import LiveTournamentsSection from '@/components/home/LiveTournamentsSection'
import UpcomingTournamentsSection from '@/components/home/UpcomingTournamentsSection'
import GamesSection from '@/components/home/GamesSection'
import FeaturedWinnersSection from '@/components/home/FeaturedWinnersSection'
import LeaderboardSection from '@/components/home/LeaderboardSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import SponsorsSection from '@/components/home/SponsorsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FAQSection from '@/components/home/FAQSection'
import CTABanner from '@/components/home/CTABanner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-950">
      <Navbar />
      <HeroSection />
      <LiveTournamentsSection />
      <UpcomingTournamentsSection />
      <GamesSection />
      <FeaturedWinnersSection />
      <LeaderboardSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SponsorsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </main>
  )
}
