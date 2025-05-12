import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950" />
      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The Smartest, Simplest Way to Sell Your Used Goods.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Effortless AI listings and buyer negotiations – selling made truly simple and intelligent.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/sell">
              <Button size="lg" className="rounded-full">
                Post Your Item with AI
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
