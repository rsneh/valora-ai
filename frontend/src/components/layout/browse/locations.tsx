"use client"

import { Suspense, useState } from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "@/components/location-context"
import { LocationEditIcon } from "lucide-react";
import AutoComplete from "@/components/ui/autocomplete-location";
import { useI18nContext } from "@/components/locale-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function LocationFilter() {
  const { location, setLocation } = useLocation();
  const { t } = useI18nContext();
  const [showSearch, setShowSearch] = useState(false);
  return (
    <div className="flex flex-col-reverse md:flex-row">
      <div className={cn("transition-all duration-600 ease-out z-40 animate-width overflow-hidden mt-2 md:mt-0 md:mx-2", {
        "w-full md:w-72": showSearch,
        "w-0 h-0": !showSearch,
      })}>
        <AutoComplete
          placeholder={t("locationFilter.inputPlaceholder")}
          onLocationSelect={(location) => {
            setLocation({
              location_text: location?.name,
              latitude: location?.latitude,
              longitude: location?.longitude,
            });
            setShowSearch(false);
          }}
        />
      </div>
      <Tooltip>
        <TooltipTrigger>
          <div className="text-xs flex items-center gap-1" onClick={() => setShowSearch(!showSearch)}>
            <LocationEditIcon className="text-gray-500" size={16} strokeWidth={2} />
            <span className="text-neutral-500">{t("locationFilter.title")}</span>
            <span>
              {location?.location_text ?? t("locationFilter.unknown")}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-gray-500">{t("locationFilter.tooltipText")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded-sm';
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300';
const items = 'bg-neutral-400 dark:bg-neutral-700';

export default function Locations() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={cn(skeleton, activeAndTitles)} />
          <div className={cn(skeleton, activeAndTitles)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
          <div className={cn(skeleton, items)} />
        </div>
      }
    >
      <LocationFilter />
    </Suspense>
  );
}