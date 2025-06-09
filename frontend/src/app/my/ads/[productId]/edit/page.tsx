"use client";

import { useAuth } from '@/components/auth/auth-context';
import { MyEditProductPage } from '@/components/my/edit-product';
import { getProductById } from '@/services/api/products';
import { Product } from '@/types/product';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getProduct(productId: string, firebaseIdToken?: string) {
  try {
    const updatedProduct = await getProductById(productId as string, firebaseIdToken!);
    return updatedProduct;
  } catch (error: Error | any) {
    console.error("Error fetching product:", error.message);
    return null;
  }
}

export default function AdEditPage() {
  const params = useParams();
  const { productId } = params;
  const { firebaseIdToken } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (firebaseIdToken && productId) {
      const fetchProduct = async () => {
        const fetchedProduct = await getProduct(productId as string, firebaseIdToken);

        if (!fetchedProduct) {
          console.log("Invalid product ID or product not found");
          setIsLoading(false);
        }

        setProduct(fetchedProduct);
        setIsLoading(false);
      };
      fetchProduct();
    }
  }, [productId, firebaseIdToken])

  if (isLoading) return <div className="animate-pulse">Loading...</div>;

  return (
    <>
      {product ? (
        <MyEditProductPage product={product!} />
      ) : (
        <div className="text-center text-red-500">Product not found</div>
      )}
    </>
  );
}