"use client"

import { Suspense } from "react"
// import { Slider } from "@/components/ui/slider"
import { categories, cn } from "@/lib/utils"
import FilterList from "./filter"

function CategoryList() {
  // Map categories to ListItem type
  const listItems = categories.map((category) => ({
    path: `/browse/${category.value}`,
    title: category.title,
  }));
  listItems.unshift({
    path: '/browse',
    title: 'All',
  });
  return <FilterList list={listItems} title="Categories" />;
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded-sm';
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300';
const items = 'bg-neutral-400 dark:bg-neutral-700';

export default function Categories() {
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
      <CategoryList />
    </Suspense>
  );
}