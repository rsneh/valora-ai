import { type ClassValue, clsx } from "clsx"
import { MonitorSmartphone } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: "electronics", label: "Electronics", isHighlighted: true, description: "Latest gadgets and devices", icon: "monitor-smartphone" },
  { value: "furniture", label: "Furniture", isHighlighted: true, description: "Stylish and comfortable furniture", icon: "sofa" },
  { value: "clothing", label: "Clothing", isHighlighted: true, description: "Fashionable clothing for all", icon: "shirt" },
  { value: "toys", label: "Toys", description: "Fun and interactive toys", icon: "toy-brick" },
  { value: "books", label: "Books", description: "A wide range of books", icon: "library-big" },
  { value: "sports", label: "Sports", description: "Sports equipment and gear", icon: "volleyball" },
];