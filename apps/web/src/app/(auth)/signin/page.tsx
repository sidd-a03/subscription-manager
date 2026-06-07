import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Sign In — Recurly",
  description: "Sign in to your Recurly subscription management account.",
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
