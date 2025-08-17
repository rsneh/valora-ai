"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOutIcon, UserRound, PlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { RegisterDialog } from "./dialogs/register-dialog"
import { LoginDialog } from "./dialogs/login-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Separator } from "./ui/separator"
import { Logo } from "./ui/logo"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useI18nContext } from "./locale-context"
import { Category } from "@/types/category"
import { useEffect, useState } from "react"

interface NavigationProps {
  categories: Category[];
}

export function Navigation({ categories = [] }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { locale, t } = useI18nContext();
  const [open, setOpen] = useState(false);
  const {
    logout,
    currentUser,
    showRegisterDialog,
    showLoginDialog,
    registerDialogDetails,
    setShowRegisterDialog,
    setShowLoginDialog,
  } = useAuth();

  const isSellPage = pathname === "/sell/";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast({ description: t("navigation.logoutSuccess"), variant: "success", });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (currentUser && (showLoginDialog || showRegisterDialog)) {
      setShowRegisterDialog(false);
      setShowLoginDialog(false);
    }
  }, [currentUser]);

  const shouldStick = categories.length !== 0 && pathname !== "/chat";

  return (
    <>
      <header className={cn("z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", {
        "sticky top-0": shouldStick,
      })}>
        <div className="px-4 flex h-16 items-center justify-between">
          <div className="hidden md:flex space-x-6 rtl:space-x-reverse items-baseline">
            <Logo />
            <nav className="flex items-center space-x-6 text-sm mx-auto font-medium rtl:space-x-reverse">
              <Link
                href={`/browse`}
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                {t("navigation.browse")}
              </Link>
              {categories.filter((category) => category.image_path).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/browse/${category.path}`}
                  className={cn(
                    "transition-colors hover:text-foreground/80 text-foreground",
                    {
                      "hidden lg:block": index > 2,
                    }
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="me-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t("navigation.toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="start" className="pe-0" aria-describedby={undefined}>
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <nav className="h-full flex flex-col h-full justify-between">
                <div className="grid gap-6 px-2 py-6">
                  <Link
                    href={`/browse`}
                    className="transition-colors hover:text-foreground/80 text-foreground"
                  >
                    {t("navigation.browse")}
                  </Link>
                  {categories.filter((category) => category.image_path).map((category) => (
                    <Link
                      key={category.id}
                      href={`/browse/${category.path}`}
                      className="transition-colors hover:text-foreground/80 text-foreground"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {!isSellPage && (
                    <Link
                      passHref
                      href="/sell/"
                      className="mt-2"
                    >
                      <Button className="w-[90%]">
                        {t("navigation.createAd")}
                      </Button>
                    </Link>
                  )}
                </div>
                {!currentUser && (
                  <div className="flex flex-col space-y-2 flex-1 justify-end py-6">
                    <Button
                      // size="sm"
                      variant="link"
                      className="flex text-foreground/80 w-[90%]"
                      onClick={() => {
                        setOpen(false);
                        setShowLoginDialog(true)
                      }}
                    >
                      {t("navigation.login")}
                    </Button>
                    <Button
                      // size="sm"
                      variant="secondary"
                      className="flex w-[90%]"
                      onClick={() => {
                        setOpen(false);
                        setShowRegisterDialog(true);
                      }}
                    >
                      {t("navigation.signup")}
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 grow flex justify-center md:hidden">
            <Logo />
          </div>
          <div className="flex justify-end md:space-x-4 rtl:space-x-reverse md:flex md:items-center">
            {!currentUser && (
              <>
                <Button
                  size="sm"
                  variant="link"
                  className="ml-auto hidden md:flex text-foreground/80"
                  onClick={() => setShowLoginDialog(true)}
                >
                  {t("navigation.login")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="ml-auto hidden md:flex"
                  onClick={() => setShowRegisterDialog(true)}
                >
                  {t("navigation.signup")}
                </Button>
              </>
            )}
            {!isSellPage && (
              <Link
                passHref
                href="/sell/"
                className={cn(
                  "ms-auto md:block",
                  {
                    "hidden": currentUser,
                    "flex": !currentUser,
                  }
                )}
              >
                <Button className="rounded-md h-6 px-2 md:h-9 md:px-3 lg:h-11 lg:px-8">
                  <PlusIcon className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline-block">{t("navigation.createAd")}</span>
                </Button>
              </Link>
            )}
            {currentUser && (
              <>
                <Separator orientation="vertical" className="hidden md:block h-8" />
                <DropdownMenu dir={locale === "he" ? "rtl" : "ltr"}>
                  <DropdownMenuTrigger asChild className="flex items-center">
                    <div className="flex items-center justify-center text-sm font-medium text-foreground hover:ring-foreground/80">
                      <span className="hidden lg:inline-block">{currentUser.full_name}</span>
                      {false ? (
                        <Image
                          src={""} //{currentUser.photoURL}
                          alt="User Avatar"
                          width={32}
                          height={32}
                          className="ms-3 rounded-full ring-2 ring-offset-2 ring-offset-background hover:ring-foreground/80"
                        />
                      ) : (
                        <span className=" rounded-full ring-2 ring-offset-2 ring-offset-background hover:ring-foreground/80 flex items-center justify-center md:ms-3 md:h-8 md:w-8">
                          <UserRound className="text-gray-400" />
                        </span>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => router.push("/my/profile")}>{t("navigation.profile")}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/my/ads")}>{t("navigation.ads")}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/my/favorites")}>{t("navigation.favorites")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}><LogOutIcon />{t("navigation.logout")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>
      <RegisterDialog
        {...registerDialogDetails}
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        closeDialog={() => setShowRegisterDialog(false)}
        openSignInDialog={(open) => {
          setShowRegisterDialog(false);
          setShowLoginDialog(open);
        }}
      />
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        closeDialog={() => setShowLoginDialog(false)}
        openSignUpDialog={(open) => {
          setShowLoginDialog(false);
          setShowRegisterDialog(open);
        }}
      />
    </>
  )
}