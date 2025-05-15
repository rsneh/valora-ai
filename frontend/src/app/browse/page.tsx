// import { defaultSort, sorting } from "@/lib/constants"
import { ProductList } from "@/components/product/product-list"
import { Product } from "@/types/product"
import { getProducts } from "@/services/api/products"

export default async function BrowsePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const {
    // sort, 
    q: searchValue,
  } = searchParams as { [key: string]: string };
  // const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  const products: Product[] = await getProducts(); // sortKey, reverse, query: searchValue
  const resultsText = products.length > 1 ? 'results' : 'result';

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? 'There are no products that match '
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {products.length > 0 ? (
        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductList products={products} />
        </div>
      ) : null}
    </>
  )
}
