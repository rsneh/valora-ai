"use client"

import { useAuth } from "@/components/auth/auth-context"
import { getProducts } from "@/services/api/products"
import { Product } from "@/types/product"
import { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SquarePenIcon } from "lucide-react"
import Link from "next/link"
import { useI18nContext } from "@/components/locale-context"
import { ProductCard } from "@/components/product/product-card"

export default function ProfileForm() {
  const { currentUser, firebaseIdToken } = useAuth()
  const { t } = useI18nContext();
  const [ads, setAds] = useState<Product[]>([])

  useEffect(() => {
    async function fetchAds() {
      const data = await getProducts(firebaseIdToken!, { owner_id: currentUser?.id })
      setAds(data);
    }
    fetchAds()
  }, [firebaseIdToken, currentUser?.id])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">{t("my.ads.title")}</h2>
      <Suspense fallback={<div className="flex justify-center items-center h-full">{t("my.ads.loading")}</div>}>
        {ads.length === 0 ? (
          <p className="text-sm text-gray-500">{t("my.ads.noAds")}</p>
        ) : (
          <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {ads.map((ad) => {
                return (
                  <div key={ad.id} className="relative group">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 end-2 p-2 bg-white rounded-full w-8 h-8 z-10"
                      asChild
                    >
                      <Link href={`/my/ads/${ad.id}/edit`}>
                        <SquarePenIcon className="text-gray-500" />
                      </Link>
                    </Button>
                    <ProductCard product={ad} showFavorite={false} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Suspense>
    </div>
  )
}
