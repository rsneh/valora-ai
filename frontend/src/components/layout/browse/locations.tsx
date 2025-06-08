"use client"

import { Suspense, useState } from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "@/components/location-context"
import { MapPinIcon } from "lucide-react";
import AutoComplete from "@/components/ui/autocomplete-location";
import { useI18nContext } from "@/components/locale-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function LocationFilter() {
  const { location, setLocation } = useLocation();
  const [tmpLocation, setTmpLocation] = useState(location);
  const { t } = useI18nContext();
  return (
    <div className="flex flex-col-reverse md:flex-row">
      <Dialog>
        <DialogTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-primary flex items-center gap-1 hover:underline cursor-pointer">
                <MapPinIcon size={18} strokeWidth={2} />
                <span>
                  {location?.location_text ?? t("locationFilter.unknown")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs text-gray-500">{t("locationFilter.tooltipText")}</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm md:max-w-2xl">
          <DialogTitle>
            {t("locationFilter.dialogTitle")}
          </DialogTitle>
          <DialogDescription asChild>
            <p className="text-sm text-gray-500 p-0">
              {t("locationFilter.dialogDescription")}
            </p>
          </DialogDescription>
          <div>
            <AutoComplete
              placeholder={t("locationFilter.inputPlaceholder")}
              onLocationSelect={(location) => {
                setTmpLocation({
                  location_text: location?.name,
                  latitude: location?.latitude,
                  longitude: location?.longitude,
                });
              }}
            />
          </div>
          <div
            style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
          >
            <DialogClose asChild>
              <Button onClick={() => setLocation(tmpLocation)}>{t("locationFilter.dialogApplyButton")}</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
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