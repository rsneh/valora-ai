import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export default function SearchProduct({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="py-8 container mx-auto px-4 flex-grow">
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}