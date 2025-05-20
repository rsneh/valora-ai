// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
import { ProductList } from '@/components/product/product-list';
import { getDictionary, getLocaleFromRequest } from '@/lib/dictionaries';
import { getCategoryByValue, translate } from '@/lib/utils';
import { getCategoryProducts } from '@/services/api/products';

// export async function generateMetadata(props: {
//   params: Promise<{ collection: string }>;
// }): Promise<Metadata> {
//   const params = await props.params;
//   const collection = await getCollection(params.collection);

//   if (!collection) return notFound();

//   return {
//     title: collection.seo?.title || collection.title,
//     description:
//       collection.seo?.description || collection.description || `${collection.title} products`
//   };
// }

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const locale = await getLocaleFromRequest();
  const dictionary = await getDictionary(locale);

  const t = (key: string, scope?: string): string => translate(dictionary, key, scope);

  const params = await props.params;
  // const searchParams = await props.searchParams;
  // const { sort } = searchParams as { [key: string]: string };
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCategoryProducts(params.category);
  const category = getCategoryByValue(params.category);

  return (
    <div className="container mx-auto px-4">
      {category && (
        <h2 className="text-2xl font-bold mb-8 md:text-4xl">
          {t(`categories.${category.value}.title`)}
        </h2>
      )}
      {products.length === 0 ? (
        <p className="py-3 md:py-6 text-lg text-center">{t("browse.noProductsFound")}</p>
      ) : (
        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductList products={products} />
        </div>
      )}
    </div>
  );
}