// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
import { ProductList } from '@/components/product/product-list';
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
  const params = await props.params;
  // const searchParams = await props.searchParams;
  // const { sort } = searchParams as { [key: string]: string };
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCategoryProducts(params.category);

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this category.`}</p>
      ) : (
        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductList products={products} />
        </div>
      )}
    </section>
  );
}