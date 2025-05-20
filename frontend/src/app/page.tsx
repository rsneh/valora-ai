import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { IntelligentFeatures } from "@/components/intelligent-features"
import { Footer } from "@/components/footer"
import { CategoriesSection } from "@/components/categories-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <IntelligentFeatures />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  )
}
