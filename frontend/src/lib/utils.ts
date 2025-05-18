import { Category } from "@/types/product";
import { type ClassValue, clsx } from "clsx"
import { ReadonlyURLSearchParams } from 'next/navigation'
import { twMerge } from "tailwind-merge"

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
    title: "Electronics",
    description: "Gadgets, devices, phones, computers, consoles.",
    icon: "monitor-smartphone",
    show: true,
    imagePath: "/images/category/electronics.jpg",
  },
  {
    value: "fashion",
    title: "Fashion & Apparel",
    menu: "Fashion",
    description: "Clothing, shoes, bags, accessories.",
    icon: "shirt",
    show: true,
    imagePath: "/images/category/fashion.jpg",
  },
  {
    value: "home-goods",
    title: "Home Goods & Furniture",
    menu: "Furniture",
    description: "Furniture, decor, kitchen, appliances.",
    icon: "sofa",
    show: true,
    imagePath: "/images/category/home-goods.jpg",
  },
  {
    value: "collectibles",
    title: "Collectibles & Hobbies",
    menu: "Collectibles",
    description: "Collectibles, antiques, hobbies, instruments.",
    icon: "palette",
    show: true,
    imagePath: "/images/category/collectibles.jpg",
  },
  {
    value: "books-media",
    title: "Books & Media",
    menu: "Books",
    description: "Books, comics, music, movies.",
    icon: "library-big",
    imagePath: "/images/category/books.jpg",
  },
  {
    value: "sports-outdoors",
    title: "Sports & Outdoors",
    menu: "Sports",
    description: "Sports gear, fitness, outdoor items.",
    icon: "volleyball",
    imagePath: "/images/category/sports.jpg",
  },
  {
    value: "other",
    title: "Other",
    description: "For all other items.",
  },
];

export const getCategoryByValue = (value: string): Category | undefined => {
  return categories.find((cat) => cat.value === value);
}