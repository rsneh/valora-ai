import { Filters } from "@/components/layout/browse/filters";
import { Suspense } from "react";
import ChildrenWrapper from "./children-wrapper";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { getCategories } from "@/services/api/categories";
import { getLocaleFromRequest } from "@/lib/dictionaries";

export default async function BrowseLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromRequest();
  const categories = await getCategories(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation categories={categories} />
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