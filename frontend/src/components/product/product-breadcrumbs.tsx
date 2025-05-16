import { getCategoryByValue } from "@/lib/utils";
import { Product } from "@/types/product";
import { useMemo } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "../ui/breadcrumb";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export const ProductBreadcrumbs = ({ product }: { product: Product }) => {
  const category = useMemo(
    () => product.category ? getCategoryByValue(product.category) : null,
    [product.category]
  );
  return (
    <Breadcrumb className="flex list-none space-x-2 text-sm text-gray-400 mb-4 items-center">
      <BreadcrumbItem className="">
        <BreadcrumbLink asChild className="hover:text-gray-800">
          <Link href="/" className="flex items-center">
            <HomeIcon className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
        <BreadcrumbSeparator className="text-gray-400" />
      </BreadcrumbItem>
      <BreadcrumbItem className="text-gray-500">
        {category && (
          <BreadcrumbLink asChild className="hover:text-gray-800">
            <Link href={`/browse/${category.value}`} className="flex items-center">
              {category.title}
            </Link>
          </BreadcrumbLink>
        )}
        <BreadcrumbSeparator className="text-gray-400" />
      </BreadcrumbItem>
      <BreadcrumbItem className="text-gray-500">
        <BreadcrumbLink href="/" className="hover:text-gray-800">
          {product.title}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}