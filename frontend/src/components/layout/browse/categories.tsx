"use client"

import { Suspense } from "react"
import { categories, cn } from "@/lib/utils"
import FilterList, { PathFilterItem } from "./filter"
import { useI18nContext } from "@/components/locale-context";

function CategoryList() {
  const { t } = useI18nContext();
  const listItems = categories.map<PathFilterItem>((category) => ({
    path: `/browse/${category.value}/`,
    title: t(`categories.${category.value}.title`),
  }));
  listItems.unshift({
    path: '/browse/',
    title: t('categories.all'),
  });
  return <FilterList list={listItems} title={t("categories.title")} />;
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