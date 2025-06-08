// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
import { ProductList } from '@/components/product/product-list';
import { getDictionary, getLocaleFromRequest } from '@/lib/dictionaries';
import { translate } from '@/lib/utils';
import { getCategoryProducts } from '@/services/api/products';
import { cookies } from 'next/headers';

// export async function generateMetadata(
//   props: { params: { category: string } },
// ): Promise<Metadata> {
//   const params = await props.params;
//   const category = getCategoryByValue(params.category);
//   const locale = await getLocaleFromRequest(); // Get current locale for root
//   const dictionary = await getDictionary(locale);
//   const t = (key: string, scope?: string): string => translate(dictionary, key, scope);

//   return {
//     title: t("browse.seo.title"),
//     description: t("browse.seo.description"),
//   }
// }

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const locale = await getLocaleFromRequest();
  const dictionary = await getDictionary(locale);
  const params = await props.params;
  const location = cookieStore.get('userLocation') ? JSON.parse(cookieStore.get('userLocation')!.value) : null;
  let locationQuery = {};
  if (location) {
    locationQuery = {
      lat: location.latitude,
      lng: location.longitude,
    };
  }


  const t = (key: string, scope?: string): string => translate(dictionary, key, scope);

  // const searchParams = await props.searchParams;
  // const { sort } = searchParams as { [key: string]: string };
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCategoryProducts(locale, params.category, locationQuery);

  return (
    <>
      {products.length === 0 ? (
        <p className="py-3 md:py-6 text-lg text-center">{t("browse.noProductsFound")}</p>
      ) : (
        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductList products={products} category={params.category} />
        </div>
      )}
    </>
  );
}