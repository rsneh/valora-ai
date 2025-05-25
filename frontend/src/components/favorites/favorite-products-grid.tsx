"use client"

import { Product } from "@/types/product";
import { useFavorites } from "@/hooks/use-favorites";
import { ProductCard } from "../product/product-card";
import { useToast } from "@/hooks/use-toast";
import { useI18nContext } from "../locale-context";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface FavoriteProductsGridProps {
  products: Product[];
  onRemove?: (productId: number) => void;
}

export const FavoriteProductsGrid: React.FC<FavoriteProductsGridProps> = ({
  products,
  onRemove
}) => {
  const { toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const { t } = useI18nContext();

  const handleRemove = (productId: number) => {
    toggleFavorite(productId);
    if (onRemove) {
      onRemove(productId);
    }
    toast({
      title: t("productDescription.removedFromFavorites"),
      description: products.find(p => p.id === productId)?.title,
      variant: "default",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="relative group">
          <ProductCard product={product} />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(product.id)}
            aria-label={t("favorites.removeFromFavorites")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
