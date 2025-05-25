import Image from "next/image"
import logoImage from "@/assets/logo.svg"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="mr-6 flex items-baseline rtl:space-x-reverse">
      <Image
        priority
        src={logoImage}
        alt=""
        className="h-7 w-auto"
      />
      <span className="inline-block text-xl font-semibold text-2xl tracking-wide">valora.ai</span>
    </Link>
  )
}