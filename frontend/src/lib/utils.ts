import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  {
    value: "electronics",
    label: "Electronics",
    description: "Gadgets, devices, phones, computers, consoles.",
    icon: "monitor-smartphone",
    show: true,
  },
  {
    value: "fashion",
    label: "Fashion & Apparel",
    menu: "Fashion",
    description: "Clothing, shoes, bags, accessories.",
    icon: "shirt",
    show: true,
  },
  {
    value: "home-goods",
    label: "Home Goods & Furniture",
    menu: "Furniture",
    description: "Furniture, decor, kitchen, appliances.",
    icon: "sofa",
    show: true,
  },
  {
    value: "collectibles",
    label: "Collectibles & Hobbies",
    menu: "Collectibles",
    description: "Collectibles, antiques, hobbies, instruments.",
    icon: "palette",
    show: true,
  },
  {
    value: "books-media",
    label: "Books & Media",
    menu: "Books",
    description: "Books, comics, music, movies.",
    icon: "library-big",
  },
  {
    value: "sports-outdoors",
    label: "Sports & Outdoors",
    menu: "Sports",
    description: "Sports gear, fitness, outdoor items.",
    icon: "volleyball",
  },
  {
    value: "other",
    label: "Other",
    description: "For all other items.",
  },
];