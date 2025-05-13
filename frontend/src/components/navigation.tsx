"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOutIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegisterDialog } from "./dialogs/register-dialog"
import { LoginDialog } from "./dialogs/login-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Separator } from "./ui/separator"
import { Logo } from "./ui/logo"


const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "toys", label: "Toys" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
];

export function Navigation() {
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const [openRegisterDialog, setOpenRegisterDialog] = useState<boolean>(false);
  const [openLoginDialog, setOpenLoginDialog] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 flex h-16 items-center">
          <div className="mr-4 hidden md:flex md:flex-1">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {categories.map((category) => (
              <Link
                key={category.value}
                href={`/browse/${category.value}`}
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                {category.label}
              </Link>
            ))}
            <Link href="/browse" className="transition-colors hover:text-foreground/80 text-foreground">
              Browse
            </Link>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <nav className="grid gap-6 px-2 py-6">
                <Link href="/browse" className="hover:text-foreground/80">
                  Browse
                </Link>
                <Link href="/sell" className="hover:text-foreground/80">
                  Sell
                </Link>
                <Link href="/profile" className="hover:text-foreground/80">
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
            {!currentUser && (
              <>
                <Button
                  size="sm"
                  variant="link"
                  className="ml-auto hidden md:flex text-foreground/80"
                  onClick={() => setOpenLoginDialog(true)}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="ml-auto hidden md:flex"
                  onClick={() => setOpenRegisterDialog(true)}
                >
                  Sign Up
                </Button>
              </>
            )}
            <Link href="/sell" passHref>
              <Button size="lg" className="ml-auto hidden md:flex">
                Post for Sale
              </Button>
            </Link>
            {currentUser && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2">
                    {currentUser.displayName}
                    <Image
                      src={currentUser.photoURL || ""}
                      alt="User Avatar"
                      className="ms-3 h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background"
                      width={32}
                      height={32}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => router.push("/profile")}>Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => logout()}><LogOutIcon />Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div >
      </header >
      <RegisterDialog
        open={openRegisterDialog}
        onOpenChange={setOpenRegisterDialog}
        openSignInDialog={(open) => {
          setOpenRegisterDialog(false);
          setOpenLoginDialog(open);
        }}
      />
      <LoginDialog
        open={openLoginDialog}
        onOpenChange={setOpenLoginDialog}
        openSignUpDialog={(open) => {
          setOpenLoginDialog(false);
          setOpenRegisterDialog(open);
        }}
      />
    </>
  )
}