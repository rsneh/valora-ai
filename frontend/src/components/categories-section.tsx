"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18nContext } from "./locale-context";
import { Category } from "@/types/category";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const { t } = useI18nContext();
  return (
    <section id="categories" className="px-6 space-y-6 py-8 bg-gray-50 md:py-12 lg:py-24">
      <div className="mx-auto md:container">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl gradient-text">
            {t("categoriesSection.title")}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter((category) => category.image_path).map((category, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg bg-white shadow-md">
              <div className="aspect-[4/3] relative">
                <Image
                  src={`/images/category/${category.image_path!}`}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={`/browse/${category.category_key}`} className="block h-full w-full">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {category.description}
                      </p>
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
              <span className="font-bold">{t("categoriesSection.browseAll")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
