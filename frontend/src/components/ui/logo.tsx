import Image from "next/image"
import logoImage from "@/assets/valora-logo.svg"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/">
      <Image
        priority
        src={logoImage}
        alt=""
        className="h-7 w-auto"
      />
    </Link>
  )
}