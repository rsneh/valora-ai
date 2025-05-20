"use client"

import { useAuth } from "@/components/auth/auth-context"
import Image from "next/image"
import { getProducts } from "@/services/api/products"
import { Product } from "@/types/product"
import { Suspense, useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SquarePenIcon } from "lucide-react"
import Link from "next/link"
import { useI18nContext } from "@/components/locale-context"

export default function ProfileForm() {
  const { currentUser, firebaseIdToken } = useAuth()
  const { t } = useI18nContext();
  const [ads, setAds] = useState<Product[]>([])

  useEffect(() => {
    async function fetchAds() {
      const data = await getProducts(firebaseIdToken!, { seller_id: currentUser?.uid })
      setAds(data)
    }
    fetchAds()
  }, [])

  return (
    <div className="p-8 min-h-screen container mx-auto">
      <h2 className="text-2xl font-bold mb-8">{t("my.ads.title")}</h2>
      <div className="w-full space-y-8 p-6 bg-white/50 backdrop-blur-xs shadow-xs">
        <Suspense fallback={<div className="flex justify-center items-center h-full">{t("my.ads.loading")}</div>}>
          <div className="flex flex-col items-center justify-center">
            {ads.length === 0 ? (
              <p className="text-sm text-gray-500">{t("my.ads.noAds")}</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {ads.map((ad) => (
                  <Card key={ad.id}>
                    <div className="flex justify-end p-2">
                      <Button size="icon" variant="ghost" title="Edit Ad" asChild>
                        <Link href={`/my/ads/${ad.id}/edit`}>
                          <SquarePenIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="p-5">
                      {ad.image_url && (
                        <div className="relative inline-block h-48 w-full">
                          <Image
                            src={ad.image_url}
                            className="relative h-full w-full object-contain"
                            loading="lazy"
                            alt={ad.title}
                            fill
                            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>
                      )}
                      <CardTitle className="text-lg font-semibold mb-2">
                        {ad.title}
                      </CardTitle>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xl font-bold text-blue-600">${ad.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  )
}
