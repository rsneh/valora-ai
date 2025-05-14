import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import SellerPostWizard from "@/components/seller/post-wizard"

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="pt-8 bg-[url('/images/background-splash.png')] bg-center bg-cover min-h-screen">
        <SellerPostWizard />
      </main>
      <Footer />
    </div>
  )
}