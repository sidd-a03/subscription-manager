import { images } from "@/constants/image"
import Image from "next/image"

export function AuthCover() {
  return (
    <div className="relative hidden lg:flex flex-col overflow-hidden bg-slate-900">
      <Image
        src={images.authCoverImage}
        alt="Recurly subscription dashboard preview"
        fill
        className="object-cover opacity-80"
        priority
      />
      {/* Bottom-left overlay text */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
      <div className="relative mt-auto p-10 text-white">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1">
          <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium text-teal-300 tracking-wide">Live subscription data</span>
        </div>
        <p className="text-2xl font-bold leading-snug mb-2">
          All your subscriptions,<br />
          one powerful dashboard.
        </p>
        <p className="text-sm text-slate-400">
          Track MRR, churn, and subscriber growth — in real time.
        </p>
      </div>
    </div>
  )
}
