import React from "react"
import { AuthCover } from "@/components/auth/AuthCover"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — form panel */}
      <div className="flex flex-col p-8 md:p-12 bg-white dark:bg-slate-950">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 shadow-md shadow-teal-600/30">
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h5" />
              <path d="M17.5 17.5 16 16.3V14" />
              <circle cx="17" cy="17" r="5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Recurly
          </span>
        </div>

        {/* Page content (sign-in or sign-up form) */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Right — cover image */}
      <AuthCover />
    </div>
  )
}