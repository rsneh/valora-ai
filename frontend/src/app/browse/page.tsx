// import { defaultSort, sorting } from "@/lib/constants"
import { ProductList } from "@/components/product/product-list"
import { Product } from "@/types/product"
import { getProducts } from "@/services/api/products"
import { cookies } from 'next/headers'

export default async function BrowsePage() {
  const cookieStore = await cookies();
  const location = cookieStore.get('userLocation') ? JSON.parse(cookieStore.get('userLocation')!.value) : null;

  let locationQuery = {};
  if (location) {
    locationQuery = {
      lat: location.latitude,
      lng: location.longitude,
    };
  }
  const products: Product[] = await getProducts(undefined, locationQuery);

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
