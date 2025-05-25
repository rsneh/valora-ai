import { Navigation } from "@/components/navigation"
import { IntelligentFeatures } from "@/components/intelligent-features"
import { Footer } from "@/components/footer"
import { CategoriesSection } from "@/components/categories-section"
import { getCategories } from "@/services/api/categories"
import { getLocaleFromRequest } from "@/lib/dictionaries"
import HeroTwo from "@/components/hero-two"

export default async function HomePage() {
  const locale = await getLocaleFromRequest();
  const categories = await getCategories(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation categories={categories} />
      <main className="flex-1">
        <HeroTwo />
        <IntelligentFeatures />
        <CategoriesSection categories={categories} />
      </main>
      <Footer />
    </div>
  )
}
