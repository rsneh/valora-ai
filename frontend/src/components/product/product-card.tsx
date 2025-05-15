"use client"

import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useMemo } from "react";
import { categories } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const placeholderImage = "https://placehold.co/600x400/E2E8F0/A0AEC0?text=No+Image";
  const category = useMemo(
    () => categories.find(cat => cat.value === product.category || cat.title === product.category),
    [product.category]
  );
  return (
    <div className="border rounded-lg shadow-lg bg-white animate-fadeIn">
      <Link href={`/product/${product.id}`}>
        <div className="relative inline-block h-48 w-full">
          <Image
            src={product.image_url || placeholderImage}
            className="relative h-full w-full object-contain"
            loading="lazy"
            alt={product.title}
            fill
            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.title}>
          <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
            {product.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 mb-2 h-10 overflow-hidden">
          {product.description ? (product.description.length > 60 ? product.description.substring(0, 60) + "..." : product.description) : "No description."}
        </p>
        {category && (
          <Badge className="px-3 py-1.5" variant="secondary">
            {category.title}
          </Badge>
        )}
        <div className="flex justify-between items-center mt-3">
          <p className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};