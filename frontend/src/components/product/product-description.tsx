"use client"

import { Product } from "@/types/product";
import { StartChatButton } from "./start-chat-button";
import { useI18nContext } from "../locale-context";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const { t } = useI18nContext();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(isFavorite(product.id));
  const currencySign = getCurrencySymbol(product.currency!);
  const attributeEntries = Object.entries(product.attributes ?? {});
  return (
    <div className="lg:col-span-3">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.title}</h1>
        <div className="mt-4">
          <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
            <p className="text-xl text-gray-700">{`${currencySign}${product.price}`}</p>
          </div>
        </div>

        {/* <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mb-6 border-t border-b border-gray-200 py-3">
          <span>{t("productDescription.posted")}: {new Date(product.time_created).toLocaleDateString()}</span>
          {product.time_updated && product.time_updated !== product.time_created && (
            <span>{t("productDescription.updated")}: {new Date(product.time_updated).toLocaleDateString()}</span>
          )}
        </div> */}

        {product.description && (
          <div className="mt-4">
            <p className="text-gray-400 leading-relaxed whitespace-pre-line font-light">
              {product.description}
            </p>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <StartChatButton
            productId={product.id.toString()}
            buttonTxt={t("productDescription.startChat")}
          />
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              toggleFavorite(product.id);
              const newFavState = !isFavorited;
              setIsFavorited(newFavState);
              toast({
                title: newFavState
                  ? t("productDescription.addedToFavorites")
                  : t("productDescription.removedFromFavorites"),
                description: product.title,
                variant: "default",
              });
            }}
          >
            <Heart className={`h-5 w-5 me-2 ${isFavorited ? "fill-current text-red-500" : ""}`} />
            {isFavorited
              ? t("productDescription.removeFromFavorites")
              : t("productDescription.addToFavorites")}
          </Button>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-gray-200">
        {attributeEntries && (
          <div>
            <h2 className="text-sm font-medium mb-2">
              {t("productDescription.attributes")}
            </h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              {product.condition && (
                <div>
                  <dt className="font-medium text-gray-900">{t("productDescription.conditionLabel")}</dt>
                  <dd className="mt-2 text-sm text-gray-500">{t(`condition.${product.condition.toLowerCase()}`)}</dd>
                </div>
              )}
              {attributeEntries.map(([key, value], index) => (
                <div key={index} className="">
                  <dt className="font-medium text-gray-900">{t(`productAttributes.${key.toLowerCase()}`)}</dt>
                  <dd className="mt-2 text-sm text-gray-500">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  )
};