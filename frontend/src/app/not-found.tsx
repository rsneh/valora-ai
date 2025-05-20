"use client"

import { useI18nContext } from '@/components/locale-context';
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PageNotFound() {
  const { t } = useI18nContext();
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
            {t("notFound.title")}
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
            {t("notFound.description")}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link
                href="/"
              >
                {t("notFound.backToHome")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
