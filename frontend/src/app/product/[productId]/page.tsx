import { type Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/api/products';
import { ProductProvider } from '@/components/product/product-context';
import { Gallery } from '@/components/product/gallery';
import { ProductBreadcrumbs } from '@/components/product/product-breadcrumbs';
import { ProductDescription } from '@/components/product/product-description';
import { getCategoryBreadcrumbs } from '@/services/api/categories';
import { getLocaleFromRequest } from '@/lib/dictionaries';

async function fetchProduct(productId: string) {
  try {
    return await getProductById(productId);
  } catch (error: Error | any) {
    console.error("Error fetching product:", error.message);
    notFound();
  }
}

export async function generateMetadata(props: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await fetchProduct(params.productId);

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
  const product = await fetchProduct(params.productId);
  const locale = await getLocaleFromRequest()

  if (!product) return notFound();

  const breadcrumbCategories = await getCategoryBreadcrumbs(locale, product.category_id.toString());

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
      <ProductBreadcrumbs product={product} categories={breadcrumbCategories} />
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 md:gap-12 lg:gap-x-16 lg:gap-y-10">
          <Gallery product={product} />
          <Suspense fallback={null}>
            <ProductDescription product={product} />
          </Suspense>
        </div>
      </Suspense>
    </ProductProvider>
  );
}