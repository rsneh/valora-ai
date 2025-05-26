// import { defaultSort, sorting } from "@/lib/constants"
import { ProductList } from "@/components/product/product-list"
import { Product } from "@/types/product"
import { getProducts } from "@/services/api/products"

export default async function BrowsePage() {
  const products: Product[] = await getProducts();

  return (
    <>
      {products.length > 0 ? (
        <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductList products={products} />
        </div>
      ) : null}
    </>
  )
}
