"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import Image from "next/image";

interface GalleryProps {
  product: Product;
}

export const Gallery = ({ product }: GalleryProps) => {
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setMainImage(product.image_url);
      if (product.image_url) {
        setThumbnails([
          product.image_url,
        ]); //.filter(img => img !== product.image_url).slice(0, 3)); // Show up to 3 other dummy thumbnails
      }
    }
  }, [product]);

  return (
    <div className="flex flex-col-reverse md:flex-row grow">
      {thumbnails.length > 0 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[450px] pe-4">
          {thumbnails.map((thumbUrl, index) => (
            <div
              key={index}
              onClick={() => setMainImage(thumbUrl)}
              className={cn(
                'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
                'w-20 h-20 cursor-pointer transition duration-300 ease-in-out',
                {
                  'border-2 border-blue-600': mainImage === thumbUrl,
                  'border-neutral-200 dark:border-neutral-800': mainImage !== thumbUrl
                }
              )}
            >
              <Image
                className={cn('relative h-full w-full object-contain', {
                  'transition duration-300 ease-in-out group-hover:scale-105': mainImage === thumbUrl
                })}
                alt="Thumbnail"
                width={80}
                height={80}
                src={thumbUrl}
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {mainImage && (
          <Image
            className="h-full w-full object-contain"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={product.title}
            src={mainImage as string}
            priority
          />
        )}

        {/* Category Badge */}
        {product.category && (
          <Badge className="absolute top-3 right-3 font-semibold px-3 py-1.5">
            {product.category}
          </Badge>
        )}
      </div>
    </div>
  );
}