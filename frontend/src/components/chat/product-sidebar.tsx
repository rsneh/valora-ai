"use client";

import { Product } from "@/types/product";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ChatProductSidebarProps {
  product: Product;
}

const ChatProductSidebar = ({ product }: ChatProductSidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100 mb-4">Product Details</h2>
      <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow">
        <Image
          src={product.image_url!}
          className="rounded-md mb-3 w-full object-cover"
          loading="lazy"
          alt={product.title}
          width={300}
          height={200}
        />
        <h3 className="font-medium text-slate-800 dark:text-slate-100">{product.title}</h3>
        <p className="text-lg font-bold text-blue-500 dark:text-blue-400">${product.price.toFixed(2)}</p>
        {product.location_text && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Location: ${product.location_text}</p>
        )}
        <Link href={`/products/${product.id}`} className="block text-center mt-3 w-full p-2 text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
          View Details
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100 mt-6 mb-4">Seller Tips</h2>
      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <li className="flex items-start">
          <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
          Be clear and concise in your messages.
        </li>
        <li className="flex items-start">
          <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
          Agree on a price and meeting point before sharing personal details.
        </li>
      </ul>
    </aside>
  );
};

export default ChatProductSidebar;
