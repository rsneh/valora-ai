import { Suspense } from "react";
import { ChatContextProvider } from "./chat-context";
import ChatProductSidebar from "@/components/chat/product-sidebar";
import { getProductById } from "@/services/api/products";
import { Navigation } from "@/components/navigation";

async function fetchProduct(productId: string) {
  return await getProductById(productId);
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ productId: string }>;
};

export default async function ChatLayout({ children, params }: LayoutProps) {
  const { productId } = await params;
  const product = await fetchProduct(productId);
  return (
    <div className="h-screen flex flex-col">
      <Navigation categories={[]} />
      <div className="flex flex-1 antialiased text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 font-sans">
        <ChatProductSidebar product={product} />
        <ChatContextProvider product={product}>
          <main className="flex-1 flex flex-col md:p-6 lg:p-8 max-h-[calc(100vh-65px)]">
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chat...</div>}>
              {children}
            </Suspense>
          </main>
        </ChatContextProvider>
      </div>
    </div>
  );
}