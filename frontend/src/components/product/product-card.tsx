"use client"

import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18nContext } from "../locale-context";
import { getCurrencySymbol } from "@/lib/currency";
import { useFavorites } from "@/hooks/use-favorites";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  sizes?: string;
  className?: string;
  showFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className, sizes, showFavorite = true }) => {
  const { t } = useI18nContext();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(isFavorite(product.id));
  const currencySign = getCurrencySymbol(product.currency!);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
    <div className={cn("relative animate-fadeIn", className)}>
      <Link href={`/product/${product.id}`}>
        {product.image_url && (
          <div className="relative inline-block h-48 w-full">
            <Image
              src={product.image_url}
              className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              loading="lazy"
              alt={product.title}
              sizes={sizes || "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"}
              fill
            />
            {showFavorite && (
              <button
                onClick={handleToggleFavorite}
                className="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full shadow-md hover:bg-opacity-100 transition-all z-10"
                aria-label={isFavorited ? t("productCard.removeFromFavorites") : t("productCard.addToFavorites")}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? "fill-current text-red-500" : "text-gray-600"}`} />
              </button>
            )}
          </div>
        )}
      </Link>
      <div className="mt-2 flex justify-between">
        <p className="font-semibold text-gray-900 flex">
          {`${currencySign}${product.price}`}
        </p>
        {product.location_text && (
          <p className="mt-1 text-sm text-gray-500">
            {product.location_text}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          <Link href={`/product/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title}
          </Link>
        </h3>
        {product.distance_km !== null && (
          <p className="bg-opacity-70 text-gray-500 text-xs">
            {product.distance_km?.toFixed(0)} {t("productCard.kmAway")}
          </p>
        )}
      </div>
    </div>
  );
};