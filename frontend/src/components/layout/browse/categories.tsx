"use client"

import { Suspense } from "react"
import { cn } from "@/lib/utils"
import FilterList, { PathFilterItem } from "./filter"
import { useI18nContext } from "@/components/locale-context";
import { Category } from "@/types/category";
import { useCategories } from "@/components/categories-context";

function CategoryList({ categories }: { categories: Category[] }) {
  const { t } = useI18nContext();
  const listItems = categories.map<PathFilterItem>((category) => ({
    path: `/browse/${category.path}/`,
    name: category.name,
  }));
  listItems.unshift({
    path: '/browse/',
    name: t('categories.all'),
  });
  return <FilterList list={listItems} title={t("categories.title")} />;
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded-sm';
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300';
const items = 'bg-neutral-400 dark:bg-neutral-700';

export default function Categories() {
  const { categories } = useCategories();

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
      <CategoryList categories={categories} />
    </Suspense>
  );
}