"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

interface GalleryProps {
  product: Product;
}

export const Gallery = ({ product }: GalleryProps) => {
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const placeholderImage = "https://placehold.co/600x400/E2E8F0/A0AEC0?text=No+Image";

  useEffect(() => {
    if (product) {
      setMainImage(product.image_url);
      if (product.image_url) {
        setThumbnails([
          product.image_url,
          "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Img+2",
          "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Img+3",
          "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Img+4",
        ].filter(img => img !== product.image_url).slice(0, 3)); // Show up to 3 other dummy thumbnails
        if (!thumbnails.includes(product.image_url) && product.image_url) {
          setThumbnails(prev => [product.image_url!, ...prev.slice(0, 2)]);
        }
      }
    }
  }, [product]);

  return (
    <div className="flex flex-col-reverse md:flex-row">
      {thumbnails.length > 0 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[450px] ps-2 pe-4">
          {thumbnails.map((thumbUrl, index) => (
            <button
              key={index}
              onClick={() => setMainImage(thumbUrl)}
              className={cn(
                "w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all",
                mainImage === thumbUrl && "border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-400",
              )}
            >
              <img
                src={thumbUrl || placeholderImage}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = placeholderImage.replace('600x400', '100x100'))}
              />
            </button>
          ))}
        </div>
      )}
      <div className="flex-grow relative aspect-square md:aspect-auto md:h-[450px] rounded-xl overflow-hidden">
        <img
          src={mainImage || placeholderImage}
          alt={product.title}
          className="w-full h-full object-contain transition-opacity duration-300"
          onError={(e) => (e.currentTarget.src = placeholderImage)}
        />
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