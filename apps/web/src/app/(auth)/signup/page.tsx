import type { Metadata } from "next"
import { SignUpForm } from "@/components/signup-form"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Sign Up — Recurly",
  description: "Create your free Recurly subscription management account.",
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
