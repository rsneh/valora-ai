"use client"

import { Suspense, useState } from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "@/components/location-context"
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AutoComplete from "@/components/ui/autocomplete-location";

function LocationFilter() {
  const { location, setLocation } = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  return (
    <div className="relative">
      <h3 className="hidden text-xs text-neutral-500 md:block dark:text-neutral-400">
        Location
      </h3>
      <div className="flex flex-col justify-between items-center text-sm text-black dark:text-white">
        <div className={cn(
          "flex justify-between items-center w-full",
          "transition-all duration-300 ease-out",
          {
            "mb-8": showSearch
          })}>
          {location?.location_text ? (
            <p className="w-full">
              {location.location_text}
            </p>
          ) : (
            <div className="italic">
              Unknown
            </div>
          )}
          <div className="text-black dark:text-white">
            <Button
              className="font-light text-xs p-0 gap-1"
              size="sm"
              variant="clean"
              onClick={() => setShowSearch(!showSearch)}
            >
              Change
              <PenLineIcon />
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "absolute start-0 top-10 md:top-14 transition-all duration-300 ease-out z-99",
            showSearch
              ? "opacity-100 translate-y-0 w-full md:w-96"
              : "opacity-0 -translate-y-2 pointer-events-none w-48"
          )}
        >
          <AutoComplete
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
      </div>
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