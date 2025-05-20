"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOutIcon, UserRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { RegisterDialog } from "./dialogs/register-dialog"
import { LoginDialog } from "./dialogs/login-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Separator } from "./ui/separator"
import { Logo } from "./ui/logo"
import { useToast } from "@/hooks/use-toast"
import { categories } from "@/lib/utils"
import { useI18nContext } from "./locale-context";

export function Navigation() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18nContext();
  const {
    logout,
    currentUser,
    showRegisterDialog,
    showLoginDialog,
    registerDialogDetails,
    setShowRegisterDialog,
    setShowLoginDialog,
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast({ description: "You've been logged out.", variant: "success", });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 flex h-16 items-center justify-between">
          <div className="hidden md:flex space-x-6 rtl:space-x-reverse">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Logo />
            </Link>
            <nav className="flex items-center space-x-6 text-sm mx-auto font-medium rtl:space-x-reverse">
              {categories.filter((category) => category.show).map((category) => (
                <Link
                  key={category.value}
                  href={`/browse/${category.value}`}
                  className="transition-colors hover:text-foreground/80 text-foreground"
                >
                  {category.menu || category.title}
                </Link>
              ))}
              <Link href="/browse" className="transition-colors hover:text-foreground/80 text-foreground">
                {t("navigation.browse")}
              </Link>
            </nav>
          </div>
          <Sheet>
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
              <SheetTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Logo />
              </SheetTitle>
              <nav className="grid gap-6 px-2 py-6">
                {categories.filter((category) => category.show).map((category) => (
                  <Link
                    key={category.value}
                    href={`/browse/${category.value}`}
                    className="transition-colors hover:text-foreground/80 text-foreground"
                  >
                    {category.menu || category.title}
                  </Link>
                ))}
                <Link href="/browse" className="transition-colors hover:text-foreground/80 text-foreground">
                  {t("navigation.browse")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 grow flex justify-center md:hidden">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Logo />
            </Link>
          </div>
          <div className="justify-end md:space-x-4 rtl:space-x-reverse md:flex md:items-center">
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
            <Link href="/sell" passHref className="ml-auto hidden md:flex">
              <Button className="rounded-md md:h-9 md:px-3 lg:h-11 lg:px-8">
                {t("navigation.createAd")}
              </Button>
            </Link>
            {currentUser && (
              <>
                <Separator orientation="vertical" className="hidden md:block h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="flex items-center">
                    <div className="flex items-center justify-center text-sm font-medium text-foreground hover:ring-foreground/80">
                      <span className="hidden lg:inline-block">{currentUser.displayName}</span>
                      {currentUser.photoURL ? (
                        <Image
                          src={currentUser.photoURL}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}><LogOutIcon />{t("navigation.logout")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div >
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