import { type Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/api/products';
import { ProductProvider } from '@/components/product/product-context';
import { Gallery } from '@/components/product/gallery';
import { ProductBreadcrumbs } from '@/components/product/product-breadcrumbs';
import { ProductDescription } from '@/components/product/product-description';

export async function generateMetadata(props: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductById(params.productId);

  if (!product) return notFound();

  const indexable = true; //!product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: `${product.title} - ValueAI`,
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
        <ProductBreadcrumbs product={product} />
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <div className="bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <Gallery product={product} />
              <Suspense fallback={null}>
                <ProductDescription product={product} />
              </Suspense>
            </div>
          </div>
        </Suspense>
      </div>
    </ProductProvider>
  );
}