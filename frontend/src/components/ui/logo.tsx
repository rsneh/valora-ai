import Image from "next/image"
import logoImage from "@/assets/logo.svg"

export function Logo() {
  return (
    <>
      <Image
        priority
        src={logoImage}
        alt=""
        className="h-5 md:h-7 w-auto"
      />
      <span className="inline-block text-xl font-semibold text-2xl tracking-wide">valora.ai</span>
    </>
  )
}