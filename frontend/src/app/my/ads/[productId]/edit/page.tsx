import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/api/products';
import { MyEditProductPage } from '@/components/my/edit-product';

export default async function AdEditPage(props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const product = await getProductById(params.productId);

  if (!product) return notFound();

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <MyEditProductPage product={product} />
    </Suspense>
  );
}