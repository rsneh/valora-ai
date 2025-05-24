"use client"

import { Product } from "@/types/product";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "../ui/breadcrumb";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { Category } from "@/types/category";
import React from "react";

interface ProductBreadcrumbsProps {
  product: Product;
  categories: Category[];
}

export const ProductBreadcrumbs = ({ product, categories }: ProductBreadcrumbsProps) => {
  return (
    <Breadcrumb className="flex list-none space-x-2 rtl:space-x-reverse text-sm text-gray-400 mb-4 items-center">
      <BreadcrumbItem className="">
        <BreadcrumbLink asChild className="hover:text-gray-800">
          <Link href="/" className="flex items-center">
            <HomeIcon className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="text-gray-400" />
      {categories && categories.slice(0, 1).map((category, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem key={index} className="text-gray-500">
            <BreadcrumbLink asChild className="hover:text-gray-800">
              <Link href={`/browse/${category.path}`} className="flex items-center">
                {category.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-gray-400" />
        </React.Fragment>
      ))}
      <BreadcrumbItem className="text-gray-500">
        {product.title}
      </BreadcrumbItem>
    </Breadcrumb>
  );
}