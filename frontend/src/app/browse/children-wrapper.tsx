"use client";

import Locations from '@/components/layout/browse/locations';
import { useI18nContext } from '@/components/locale-context';
import { useLocation } from '@/components/location-context';
import { getCategoriesBySlug } from '@/services/api/categories';
import { Category } from '@/types/category';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

// Ensure children are re-rendered when the search query changes
export default function ChildrenWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const [category, setCategory] = useState<Category>();
  const { location } = useLocation();
  const { locale } = useI18nContext();

  useEffect(() => {
    const fetchCategory = async (cat: string) => {
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

  useEffect(() => {
    router.refresh();
  }, [location]);

  return (
    <Fragment>
      <div className="flex flex-row mb-3 justify-between items-end md:mb-6 md:flex-row">
        {category && (
          <h2 className="text-xl font-bold mb-2 md:mb-0 md:text-4xl">
            {category.name}
          </h2>
        )}
        <div className="ms-auto hidden md:block">
          <Locations />
        </div>
      </div>
      {children}
    </Fragment>
  );
}
