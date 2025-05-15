import { type Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/api/products';
import { Button } from '@/components/ui/button';
import { HeartIcon, UserCircleIcon } from 'lucide-react';
import { ProductProvider } from '@/components/product/product-context';
import { Gallery } from '@/components/product/gallery';


export async function generateMetadata(props: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductById(params.productId);

  if (!product) return notFound();

  const indexable = true; //!product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.title,
    description: product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: product.image_url
      ? {
        images: [
          {
            url: product.image_url,
            // width,
            // height,
            alt: product.title
          }
        ]
      }
      : null
  };
}

export default async function ProductPage(props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const product = await getProductById(params.productId);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image_url,
    // offers: {
    //   '@type': 'AggregateOffer',
    //   priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    //   highPrice: product.priceRange.maxVariantPrice.amount,
    //   lowPrice: product.priceRange.minVariantPrice.amount
    // }
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <div className="bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <Gallery product={product} />

              {/* Product Info Section */}
              <div className="flex flex-col justify-between shrink-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.title}</h1>
                  {/* <p className="text-md text-gray-500 mb-4">Special Black Edition</p> // Example Subtitle, not in Valora's model */}

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    {/* Wishlist Icon - Functionality to be implemented */}
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100">
                      <HeartIcon className="h-7 w-7" />
                    </button>
                  </div>

                  {/* Stats - Adapt for Valora (e.g., Posted Date, Seller Info) */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6 border-t border-b border-gray-200 py-3">
                    {/* <span>⭐ 4.8 (1624 Reviews)</span> // Not applicable for PoC */}
                    <span>Posted: {new Date(product.time_created).toLocaleDateString()}</span>
                    {product.time_updated && product.time_updated !== product.time_created && (
                      <span>Updated: {new Date(product.time_updated).toLocaleDateString()}</span>
                    )}
                    {/* <span>📦 1250 Sold</span> // Not applicable */}
                    {/* <span>✔️ 750 In Stock</span> // Not applicable */}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {product.description || "No description provided for this item."}
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Seller Information</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserCircleIcon className="h-6 w-6 mr-2 text-gray-400" />
                      <span>Seller ID: {product.seller_id}</span>
                    </div>
                    {/* You might add a link to a seller's profile page in the future */}
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="mt-auto"> {/* Pushes button to the bottom if content above is short */}
                  <Button
                    className="w-full text-lg py-3"
                    variant="default"
                  >
                    Contact Seller
                  </Button>
                  {/* <div className="mt-3 flex items-center">
                    <Button variant="secondary" className="flex-grow mr-2">Add to Cart</Button> // Not for Valora PoC
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </ProductProvider>
  );
}