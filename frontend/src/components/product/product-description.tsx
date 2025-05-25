"use client"

import { Product } from "@/types/product";
import { HeartIcon } from "lucide-react";
import { StartChatButton } from "./start-chat-button";
import { useI18nContext } from "../locale-context";

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const { t } = useI18nContext();
  return (
    <div className="flex flex-col justify-between shrink-1 lg:col-span-3">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.title}</h1>
        {/* <p className="text-md text-gray-500 mb-4">Special Black Edition</p> // Example Subtitle, not in Valora's model */}

        <div className="flex items-center justify-between mb-4">
          <p className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          {/* Wishlist Icon - Functionality to be implemented */}
          <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100">
            <HeartIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Stats - Adapt for Valora (e.g., Posted Date, Seller Info) */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mb-6 border-t border-b border-gray-200 py-3">
          {/* <span>⭐ 4.8 (1624 Reviews)</span> // Not applicable for PoC */}
          <span>{t("productDescription.posted")}: {new Date(product.time_created).toLocaleDateString()}</span>
          {product.time_updated && product.time_updated !== product.time_created && (
            <span>{t("productDescription.updated")}: {new Date(product.time_updated).toLocaleDateString()}</span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("productDescription.description")}</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description || t("productDescription.noDescription")}
          </p>
        </div>

        {/* <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Seller Information</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserCircleIcon className="h-6 w-6 mr-2 text-gray-400" />
                      <span>Seller ID: {product.seller_id}</span>
                    </div>
                  </div> */}

      </div>

      {/* Action Buttons */}
      <div className="mt-auto">
        <StartChatButton
          productId={product.id.toString()}
          buttonTxt={t("productDescription.startChat")}
        />
      </div>
    </div>
  )
};