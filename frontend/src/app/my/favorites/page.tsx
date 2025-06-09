"use client"

import { useState, useEffect } from "react";
import { useI18nContext } from "@/components/locale-context";
import { useFavorites } from "@/hooks/use-favorites";
import { Product } from "@/types/product";
import { getProductById } from "@/services/api/products";
import { FavoriteProductsGrid } from "@/components/favorites/favorite-products-grid";
import { Loader } from "lucide-react";

export default function FavoritesPage() {
  const { t } = useI18nContext();
  const { favorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFavoriteProducts() {
      try {
        setLoading(true);
        const productsPromises = favorites.map(id => getProductById(id));
        const products = await Promise.all(productsPromises);
        setFavoriteProducts(products);
      } catch (error: Error | any) {
        console.error("Error fetching favorite products:", error.message);
      } finally {
        setLoading(false);
      }
    }

    if (favorites.length > 0) {
      fetchFavoriteProducts();
    } else {
      setFavoriteProducts([]);
      setLoading(false);
    }
  }, [favorites]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("favorites.title")}</h1>

      {loading ? (
        <div className="flex justify-center my-12">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("favorites.noFavorites")}</p>
          <p className="text-gray-400 mt-2">{t("favorites.addFavoritesMessage")}</p>
        </div>
      ) : (
        <FavoriteProductsGrid
          products={favoriteProducts}
          onRemove={(productId) => {
            setFavoriteProducts(prevProducts =>
              prevProducts.filter(product => product.id !== productId)
            );
          }}
        />
      )}
    </div>
  );
}
