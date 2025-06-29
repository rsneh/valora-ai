"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import discordIcon from "@/assets/icons/discord.svg"
import xSocialIcon from "@/assets/icons/x-social.svg"
import linkedInIcon from "@/assets/icons/linkedin.svg"
import { Logo } from "./ui/logo"
import Image from "next/image"
import { useI18nContext } from "./locale-context"
import { useCategories } from "./categories-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu"
import { DropdownMenuArrow, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { getSupportedLocales } from "@/locales/config"
import { ChevronsUpDownIcon, GlobeIcon } from "lucide-react"

export function Footer() {
  const { categories } = useCategories();
  const { locale, setLocale, t } = useI18nContext();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              {t("footer.aboutDescription")}
            </p>
            <div className="mt-6 flex space-x-6 rtl:space-x-reverse">
              <div className="flex space-x-4 rtl:space-x-reverse">
                <Button variant="ghost" size="icon" className="w-8 h-8 py-2 px-2">
                  <Image
                    src={xSocialIcon}
                    alt="X Social Icon"
                    title="X Social"
                    className="h-4 w-4 fill-white"
                  />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 py-2 px-2" asChild>
                  <Link href="https://linkedin.com/company/valora-ai" target="_blank" rel="noopener noreferrer">
                    <Image
                      src={linkedInIcon}
                      alt="LinkedIn Icon"
                      title="LinkedIn"
                      className="h-4 w-4 fill-white"
                    />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 py-2 px-2">
                  <Image
                    src={discordIcon}
                    alt="Discord Icon"
                    title="Discord"
                    className="h-4 w-4 fill-white"
                  />
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center py-2 px-4 border rounded-md bg-white text-gray-700 justify-between hover:bg-gray-100 transition-colors duration-150">
                  <GlobeIcon className="h-4" />
                  <span className="mx-2">{t(`locales.${locale}.name`)}</span>
                  <ChevronsUpDownIcon className="h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuArrow />
                  {getSupportedLocales().map((_locale, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => setLocale(_locale)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      {t(`locales.${_locale}.name`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-col space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.company")}</h3>
              <ul className="space-y-2">
                {/* <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                    {t("footer.about")}
                  </Link>
                </li> */}
                <li>
                  <Link href="/privacy/" className="text-sm text-muted-foreground hover:text-foreground">
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms/" className="text-sm text-muted-foreground hover:text-foreground">
                    {t("footer.terms")}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                    {t("footer.contact")}
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("categories.title")}</h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link href={`/browse/${category.path}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
