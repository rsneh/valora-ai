import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { categories } from "@/lib/utils"

export function CategoriesSection() {
  return (
    <section id="categories" className="space-y-6 py-8 bg-gray-50 md:py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl gradient-text">
            Our Categories
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter((category) => category.imagePath).map((category, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg bg-white shadow-md">
              <div className="aspect-[4/3] relative">
                <Image
                  src={category.imagePath!}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={`/browse/${category.value}`} className="block h-full w-full">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-gray-200 text-sm">{category.description}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="rounded-full">
            <Link href="/browse">
              <span className="font-bold">Browse All</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
