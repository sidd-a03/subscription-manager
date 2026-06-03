import { images } from "@/constants/image"
import Image from "next/image"

export function AuthCover() {
  return (
    <div className="relative hidden lg:flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Light cover — shown in light mode, hidden in dark mode */}
      <Image
        src={images.authCoverLight}
        alt="Recurly subscription dashboard preview"
        fill
        className="object-cover opacity-100 dark:opacity-0 transition-opacity duration-500"
        priority
      />
      {/* Dark cover — hidden in light mode, shown in dark mode */}
      <Image
        src={images.authCoverDark}
        alt="Recurly subscription dashboard preview"
        fill
        className="object-cover opacity-0 dark:opacity-80 transition-opacity duration-500"
        priority
      />

      {/* Overlay gradient — only needed in dark mode, light mode image has a natural dark circle for contrast */}
      <div className="absolute inset-0 bg-linear-to-t from-transparent to-transparent dark:from-slate-950/90 dark:via-slate-900/30 dark:to-transparent" />

      {/* Bottom-left overlay text */}
      <div className="relative mt-auto p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1">
          <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium text-teal-300 tracking-wide">Live subscription data</span>
        </div>
        <p className="text-2xl font-bold leading-snug mb-2 text-white">
          All your subscriptions,<br />
          one powerful dashboard.
        </p>
        <p className="text-sm text-slate-300 dark:text-slate-400">
          Track MRR, churn, and subscriber growth — in real time.
        </p>
      </div>
    </div>
  )
}
