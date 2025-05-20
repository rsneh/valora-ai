import { Category } from "@/types/product";
import { type ClassValue, clsx } from "clsx"
import { ReadonlyURLSearchParams } from 'next/navigation'
import { twMerge } from "tailwind-merge"
import { Dictionary } from "./dictionaries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const categories: Category[] = [
  {
    value: "electronics",
    icon: "monitor-smartphone",
    show: true,
    imagePath: "/images/category/electronics.jpg",
  },
  {
    value: "fashion",
    icon: "shirt",
    show: true,
    imagePath: "/images/category/fashion.jpg",
  },
  {
    value: "home-goods",
    icon: "sofa",
    show: true,
    imagePath: "/images/category/home-goods.jpg",
  },
  {
    value: "collectibles",
    icon: "palette",
    show: true,
    imagePath: "/images/category/collectibles.jpg",
  },
  {
    value: "books-media",
    icon: "library-big",
    imagePath: "/images/category/books.jpg",
  },
  {
    value: "sports-outdoors",
    icon: "volleyball",
    imagePath: "/images/category/sports.jpg",
  },
  {
    value: "other",
    title: "Other",
  },
];

export const getCategoryByValue = (value: string): Category | undefined => {
  return categories.find((cat) => cat.value === value);
}

export const translate = (dictionary: Dictionary | null, key: string, scope?: string): string => {
  if (!dictionary) return key;
  let path = key.split('.');
  if (scope) {
    path = [scope, ...path];
  }

  let result: any = dictionary;
  for (const p of path) {
    result = result?.[p];
    if (result === undefined) {
      console.warn(`Translation key not found: ${scope ? scope + '.' : ''}${key}`);
      return key;
    }
  }
  return typeof result === 'string' ? result : key;
};