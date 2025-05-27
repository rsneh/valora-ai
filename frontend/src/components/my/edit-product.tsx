"use client";

import { Product, productConditionEnum, ProductFormData } from "@/types/product";
import { SellerAdForm } from "../seller/ad-form";
import { useState } from "react";
import { updateProduct } from "@/services/api/products";
import { useAuth } from "../auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useI18nContext } from "../locale-context";
import { useCategories } from "../categories-context";
import { uploadProductImages } from "@/services/api/images";

interface MyEditProductPageProps {
  product: Product;
}

export function MyEditProductPage({ product }: MyEditProductPageProps) {
  const router = useRouter();
  const productId = product.id;
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  const { firebaseIdToken } = useAuth();
  const { toast } = useToast();
  const { t } = useI18nContext();

  const defaultValues: Partial<ProductFormData> = {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    category_id: product.category_id,
    currency: product.currency,
    image_url: product.image_url,
    min_acceptable_price: product.min_acceptable_price,
    // negotiation_notes_for_ai: product.negotiation_notes_for_ai,
    attributes: product.attributes,
    condition: product.condition as typeof productConditionEnum[number],
    location_text: product.location_text,
  };

  async function handleUpdateProduct(formData: ProductFormData): Promise<void> {
    setLoading(true);

    try {
      const updatedData = await updateProduct(productId.toString(), formData, firebaseIdToken!);
      if (formData.images && formData.images.length > 0) {
        await uploadProductImages(updatedData.id, formData.images || [], firebaseIdToken!);
      }
      toast({
        title: t("my.ads.adUpdated"),
        description: t("my.ads.adUpdatedDescription"),
        variant: "success",
      });
      router.push("/my/ads/");
    } catch (err: any) {
      console.log("Error updating product:", err);
      toast({
        title: t("my.ads.errorUpdatingAd"),
        description: err.message || t("my.ads.errorUpdatingAdDescription"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="animate-fadeInSlideUp w-full flex-1 lg:max-w-6xl xl:max-w-7xl">
        <h1 className="text-2xl font-bold mb-4">{t("my.ads.editTitle")}</h1>
        <SellerAdForm
          defaultValues={defaultValues}
          topCategories={categories}
          onSubmit={handleUpdateProduct}
          loading={loading}
          editMode
        />
      </div>
    </div>
  );
}