import ChatLeftSidebar from "@/components/chat/left-sidebar";
import ChatProductSidebar from "@/components/chat/product-sidebar";
import { getProductById } from "@/services/api/products";
import { Suspense } from "react";
import { ChatContextProvider } from "./chat-context";

async function fetchProduct(productId: string) {
  return await getProductById(productId);
}

export default async function ChatLayout({ children, params }: {
  children: React.ReactNode;
  params: { productId: string };
}) {
  const { productId } = await params;
  const product = await fetchProduct(productId);
  return (
    <div className="flex h-screen antialiased text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 font-sans">
      <ChatLeftSidebar />

      <ChatContextProvider product={product}>
        <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 max-h-screen">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chat...</div>}>
            {children}
          </Suspense>
        </main>
      </ChatContextProvider>

      <ChatProductSidebar product={product} />
    </div>
  );
}