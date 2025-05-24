"use client"

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18nContext } from "../locale-context";
import { getCurrencySymbol } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  sizes?: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className, sizes }) => {
  const { locale } = useI18nContext();
  const category: Category | null = product.category ? (product.category as Category) : null;
  const categoryName = category ? (category[`name_${locale}` as keyof Category]) : null;
  const currencySign = getCurrencySymbol(product.currency!);
  return (
    <div className={cn("relative animate-fadeIn", className)}>
      <Link href={`/product/${product.id}`}>
        {product.image_url && (
          <div className="relative inline-block h-48 w-full">
            <Image
              src={product.image_url}
              // className="relative h-full w-full object-contain"
              className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              loading="lazy"
              alt={product.title}
              fill
              sizes={sizes || "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"}
            />
          </div>
        )}
      </Link>
      <div className="mt-2 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-500">
            <Link href={`/product/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {categoryName}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-900">{product.title}</p>
        </div>
        <p className="font-medium text-gray-900 flex">
          {`${currencySign}${product.price}`}
        </p>
      </div>
    </div>
  );
};