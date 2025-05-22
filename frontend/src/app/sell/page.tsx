import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import SellerPostWizard from "@/components/seller/post-wizard"
import { Suspense } from "react";
import { SpinnerLoader } from "@/components/ui/spinner-loader";

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="bg-[url('/images/background-splash.png')] bg-center bg-cover flex-1 min-h-screen">
        <div className="relative py-8 md:py-12 overflow-hidden">
          <div className="flex flex-col px-6 z-10">
            <Suspense fallback={<SpinnerLoader />}>
              <SellerPostWizard />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}