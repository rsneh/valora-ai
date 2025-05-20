"use client";

import { Product, ProductFormData } from "@/types/product";
import { SellerAdForm } from "../seller/ad-form";
import { useState } from "react";
import { updateProduct } from "@/services/api/products";
import { useAuth } from "../auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useI18nContext } from "../locale-context";

interface MyEditProductPageProps {
  product: Product;
}

export function MyEditProductPage({ product }: MyEditProductPageProps) {
  const router = useRouter();
  const productId = product.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { firebaseIdToken } = useAuth();
  const { toast } = useToast();
  const { t } = useI18nContext();

  const defaultValues = {
    ...product,
  };

  async function handleUpdateProduct(formData: ProductFormData): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const productData = await updateProduct(productId.toString(), formData, firebaseIdToken!);
      console.log({ productData });
      toast({
        title: t("my.ads.adUpdated"),
        description: t("my.ads.adUpdatedDescription"),
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
    <div className="bg-white p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">{t("my.ads.editTitle")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
        <SellerAdForm
          defaultValues={{ ...defaultValues }}
          onSubmit={handleUpdateProduct}
          loading={loading}
        />
      </div>
    </div>
  );
}