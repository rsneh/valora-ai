import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/api/products';
import { MyEditProductPage } from '@/components/my/edit-product';

export default async function AdEditPage(props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const product = await getProductById(params.productId);

  if (!product) return notFound();

  return (
    <div className="p-8 min-h-screen">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <div className="bg-white p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <MyEditProductPage productId={params.productId} formData={{ ...product }} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}