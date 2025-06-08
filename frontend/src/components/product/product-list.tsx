"use client";

import { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { useEffect, useState } from "react";
import { useLocation } from "../location-context";
import { getCategoryProducts, getProducts } from "@/services/api/products";
import { useI18nContext } from "../locale-context";
import { useAuth } from "../auth/auth-context";

interface ProductListProps {
  products: Product[];
  category?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ products: initialProducts, category }) => {
  const { firebaseIdToken } = useAuth();
  const { location } = useLocation();
  const { locale } = useI18nContext();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const fetchProducts = async () => {
      let locationQuery = {};
      if (location) {
        locationQuery = {
          lat: location.latitude,
          lng: location.longitude,
        };
      }
      if (category) {
        const fetchedProducts = await getCategoryProducts(locale, category, locationQuery);
        setProducts(fetchedProducts);
      } else {
        const fetchedProducts = await getProducts(firebaseIdToken!, locationQuery);
        setProducts(fetchedProducts);
      }
    };
    fetchProducts();
  }, [location])

  if (products.length === 0) {
    return <p className="text-center text-gray-500 mt-8 col-span-full">No products found at the moment. Check back soon!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};