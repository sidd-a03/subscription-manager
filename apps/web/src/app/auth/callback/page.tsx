"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useAuthStore from "@/store/useAuthStore"

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setToken } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (token) {
      setToken(token)
      console.log(useAuthStore.getState().token)
    }
    
    // Always redirect to dashboard, whether token was found or not
    // (Middleware will bounce them to /signin if they somehow have no cookie)
    router.replace("/dashboard")
  }, [searchParams, router, setToken])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-sm text-slate-500">Completing sign in...</div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="text-sm text-slate-500">Completing sign in...</div></div>}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
