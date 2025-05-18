import { Card, CardTitle } from "@/components/ui/card"
import { BrainIcon, FanIcon, ScanTextIcon } from "lucide-react"

export function IntelligentFeatures() {
  return (
    <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl gradient-text">
          Intelligent Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Valora&apos;s AI enhances the experience for everyone, making selling effortless and buying more informed.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
            <ScanTextIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 pt-6">
            <CardTitle className="text-lg font-bold">
              Smart Item Recognition
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enjoy clearer, more accurately categorized ads, making it easier to find exactly what you&apos;re looking for.
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
            <FanIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 pt-6">
            <CardTitle className="text-lg font-bold">
              Clear & Compelling Ads
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Valora&apos;s AI writes engaging, informative descriptions, saving you time and attracting more interest.
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
            <BrainIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 pt-6">
            <CardTitle className="text-lg font-bold">
              AI-Powered Communication
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Get quick answers to your questions and experience a smooth, responsive communication process when discussing an item.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
