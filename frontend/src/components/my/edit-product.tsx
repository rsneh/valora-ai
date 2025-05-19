"use client";

import { ProductFormData } from "@/types/product";
import { SellerAdForm } from "../seller/ad-form";
import { useState } from "react";
import { updateProduct } from "@/services/api/products";
import { useAuth } from "../auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface MyEditProductPageProps {
  productId: string;
  formData: ProductFormData;
}

export function MyEditProductPage({ productId, formData }: MyEditProductPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { firebaseIdToken } = useAuth();
  const { toast } = useToast();

  async function handleUpdateProduct(formData: ProductFormData): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const productData = await updateProduct(productId, formData, firebaseIdToken!);
      console.log({ productData });
      toast({
        title: "Product Updated!",
        description: "The product has been successfully updated.",
        variant: "success",
      });
      router.push("/my/ads/");
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      <SellerAdForm
        defaultValues={{ ...formData }}
        onSubmit={handleUpdateProduct}
        loading={loading}
      />
    </div>
  );
}