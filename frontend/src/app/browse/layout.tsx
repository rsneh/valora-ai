import { Filters } from "@/components/layout/browse/filters";
import { Suspense } from "react";
import ChildrenWrapper from "./children-wrapper";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export default function SearchLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Filters />
          <div className="order-last min-h-screen w-full md:order-none">
            <Suspense fallback={null}>
              <ChildrenWrapper>{children}</ChildrenWrapper>
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}