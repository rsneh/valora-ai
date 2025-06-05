"use client"

import { Product } from "@/types/product";
import { StartChatButton } from "./start-chat-button";
import { useI18nContext } from "../locale-context";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap, useLoadScript, Circle } from '@react-google-maps/api';
import { Skeleton } from "../ui/skeleton";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || "";

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const { t } = useI18nContext();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(isFavorite(product.id));
  const currencySign = getCurrencySymbol(product.currency!);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const productLocation = product.latitude && product.longitude ? {
    lat: product.latitude,
    lng: product.longitude,
  } : null;

  return (
    <div className="lg:col-span-3">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.title}</h1>
        <div className="mt-4">
          <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
            <p className="text-xl text-gray-700">{`${currencySign}${product.price}`}</p>
          </div>
        </div>

        {/* <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mb-6 border-t border-b border-gray-200 py-3">
          <span>{t("productDescription.posted")}: {new Date(product.time_created).toLocaleDateString()}</span>
          {product.time_updated && product.time_updated !== product.time_created && (
            <span>{t("productDescription.updated")}: {new Date(product.time_updated).toLocaleDateString()}</span>
          )}
        </div> */}

        {product.description && (
          <div className="mt-4">
            <p className="text-gray-400 leading-relaxed whitespace-pre-line font-light">
              {product.description}
            </p>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-8">
          <StartChatButton
            productId={product.id.toString()}
            buttonTxt={t("productDescription.startChat")}
          />
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              toggleFavorite(product.id);
              const newFavState = !isFavorited;
              setIsFavorited(newFavState);
              toast({
                title: newFavState
                  ? t("productDescription.addedToFavorites")
                  : t("productDescription.removedFromFavorites"),
                description: product.title,
                variant: "default",
              });
            }}
          >
            <Heart className={`h-5 w-5 me-2 ${isFavorited ? "fill-current text-red-500" : ""}`} />
            {isFavorited
              ? t("productDescription.removeFromFavorites")
              : t("productDescription.addToFavorites")}
          </Button>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("productDescription.sellerDescription")}</h2>
        <ul>
          {product.condition && (
            <li>
              <div className="flex">
                <span className="flex-1 font-bold">{t("productDescription.conditionLabel")}</span>
                <span className="flex-1">{t(`condition.${product.condition.toLowerCase()}`)}</span>
              </div>
            </li>
          )}
        </ul>
        <div>
          {productLocation && (
            <>
              {isLoaded ? (
                <GoogleMap
                  mapContainerClassName="h-48 mt-2 rounded-lg shadow-md"
                  zoom={10}
                  center={productLocation}
                >
                  <Circle
                    options={{
                      fillOpacity: 0.1,
                      strokeOpacity: 0.8,
                      strokeWeight: 1,
                    }}
                    center={productLocation}
                    radius={5000}
                  />
                </GoogleMap>
              ) : (
                <Skeleton className="h-48 mt-2 rounded-lg shadow-md" />
              )}
            </>
          )}
          {product.location_text && (
            <p className="text-sm mt-1 text-gray-600">{product.location_text}</p>
          )}
        </div>
      </div>
    </div>
  )
};