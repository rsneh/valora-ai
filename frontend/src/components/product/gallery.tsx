"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import Image from "next/image";

interface GalleryProps {
  product: Product;
}

export const Gallery = ({ product }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(product.image_url);

  // Ensure the main image is always set, even if product.image_url changes
  useEffect(() => {
    setSelectedImage(product.image_url);
  }, [product.image_url]);

  return (
    <div className="grid gap-4 lg:col-span-4 lg:row-end-1">
      <div className="rounded-lg">
        <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
          <Image
            className="rounded-lg transition-transform h-full w-full object-contain"
            src={selectedImage || product.image_url || ''}
            alt={product.title || "Product image"}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            priority
          />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {product.image_url && (
          <div
            onClick={() => setSelectedImage(product.image_url)}
            className={cn(
              "cursor-pointer transition-all duration-200 relative aspect-square overflow-hidden rounded-lg",
              selectedImage === product.image_url ?
                "ring-2 ring-offset-2 ring-blue-500 opacity-100 scale-100" :
                "opacity-70 hover:opacity-100 hover:scale-105"
            )}
          >
            <Image
              className="rounded-lg object-cover"
              src={product.image_url}
              alt={product.title || "Product thumbnail"}
              fill
              sizes="(max-width: 768px) 20vw, 10vw"
              priority
            />
          </div>
        )}

        {/* Additional product images */}
        {product.images?.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image.image_url)}
            className={cn(
              "cursor-pointer transition-all duration-200 relative aspect-square overflow-hidden rounded-lg",
              selectedImage === image.image_url ?
                "ring-2 ring-offset-2 ring-blue-500 opacity-100 scale-100" :
                "opacity-70 hover:opacity-100 hover:scale-105"
            )}
          >
            <Image
              className="rounded-lg object-cover"
              src={image.image_url}
              alt={product.title || "Product thumbnail"}
              fill
              sizes="(max-width: 768px) 20vw, 10vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}