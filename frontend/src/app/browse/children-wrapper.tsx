"use client";

import Locations from '@/components/layout/browse/locations';
import { useI18nContext } from '@/components/locale-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCategoriesBySlug } from '@/services/api/categories';
import { Category } from '@/types/category';
import { useParams, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

// Ensure children are re-rendered when the search query changes
export default function ChildrenWrapper({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState<Category>();
  const params = useParams();
  const searchParams = useSearchParams();
  const { locale } = useI18nContext();

  useEffect(() => {
    const fetchCategory = async (cat: string) => {
      // This effect runs when the search parameters change
      const responseCategory = await getCategoriesBySlug(locale, cat);
      if (responseCategory) {
        setCategory(responseCategory);
      } else {
        setCategory(undefined);
      }
    };
    const { category: categoryParam } = params;
    if (categoryParam) {
      fetchCategory(categoryParam as string);
    } else {
      setCategory(undefined);
    }
  }, [params, locale]);

  return (
    <Fragment key={searchParams.get('q')}>
      <TooltipProvider>
        <div className="flex flex-col justify-between mb-6 md:flex-row md:items-baseline">
          {category && (
            <h2 className="text-2xl font-bold mb-2 md:mb-0 md:text-4xl">
              {category.name}
            </h2>
          )}
          <div className="md:ms-auto">
            <Locations />
          </div>
        </div>
      </TooltipProvider>
      {children}
    </Fragment>
  );
}
