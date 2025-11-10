import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { getCategories } from "@/services/api/categories";
import { getLocaleFromRequest } from "@/lib/dictionaries";
import { MyLayoutClient } from "./my-layout-client";

export default async function MyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromRequest();
  const categories = await getCategories(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation categories={categories} />
      <MyLayoutClient>
        <main className="py-8 container mx-auto px-4 flex-grow">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </MyLayoutClient>
      <Footer />
    </div>
  );
}