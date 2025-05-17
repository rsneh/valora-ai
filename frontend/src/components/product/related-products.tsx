import { Product } from "@/types/product";
import { ProductCard } from "./product-card";

export async function RelatedProducts({ }: { productId?: string }) {
  const relatedProducts: Product[] = []; //await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product, i) => (
          <li
            key={i}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <ProductCard
              key={product.id}
              product={product}
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}