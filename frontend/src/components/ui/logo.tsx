import Image from "next/image"
import logoImage from "@/assets/logo.svg"

export function Logo() {
  return (
    <>
      <Image
        priority
        src={logoImage}
        alt=""
        className="h-6 w-auto"
      />
      <span className="hidden font-semibold text-2xl tracking-wide sm:inline-block">valora.ai</span>
    </>
  )
}