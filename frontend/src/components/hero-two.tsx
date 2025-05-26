"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FloatingItems } from "@/components/ui/floating-items"
import { RoboAnimation } from "@/components/ui/robo-animation"
import { useI18nContext } from "./locale-context"
import Link from "next/link"

export default function HeroTwo() {
  const { t } = useI18nContext();
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex pt-48 md:items-center md:pt-0">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden" dir="ltr">
        <FloatingItems count={12} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl lg:text-7xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text gradient-text">
                {t("hero.title")}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto glass-effect"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" asChild>
              <Link href="/sell">
                {t("hero.createAdButton")}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
    </div>
  )
}
