"use client"

import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "@/components/location-context"
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function LocationFilter() {
  const { location } = useLocation();
  return (
    <div>
      <h3 className="hidden text-xs text-neutral-500 md:block dark:text-neutral-400">
        Location
      </h3>
      <div className="flex justify-between items-center text-sm text-black dark:text-white">
        {location?.location_text ? (
          <div>
            <p className="w-full">
              {location.location_text}
            </p>
          </div>
        ) : (
          <div className="italic">
            Unknown
          </div>
        )}
        <div className="text-black dark:text-white">
          <Button
            className="font-light text-xs p-0"
            size="sm"
            variant="clean"
            onClick={() => console.log("Checking location")}
          >
            <PenLineIcon />
            Change
          </Button>
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