import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import SellerPostWizard from "@/components/seller/post-wizard"

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="bg-[url('/images/background-splash.png')] bg-center bg-cover flex-1 min-h-screen">
        <div className="relative space-y-6 py-8 md:py-12 overflow-hidden">
          <div className="flex mx-auto max-w-[64rem] flex-col px-6 items-center gap-4 text-center relative z-10">
            <SellerPostWizard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}