"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import toast from "react-hot-toast"
import { handleAuthError } from "@/lib/handle-auth-error"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import useAuthStore from "@/store/useAuthStore"
import { step1Schema, step2Schema } from "@/validator/multi-step.schema"
import ForgotPassword from "./forgot-password"

interface LoginFormProps {
  className?: string
}

const schema = z.object({
  email: z.email({
    message: "Invalid email"
  }),
  password: z.string().min(8, {
    message: "password length must be at least 8 characters"
  })
})

export function LoginForm({ className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const [view, setView] = useState<"signin" | "forgot-password">("signin")
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1)
  const [forgotEmail, setForgotEmail] = useState("")
  const [fullHash, setFullHash] = useState("")
  const [otpInput, setOtpInput] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [forgotErrors, setForgotErrors] = useState<{ email?: string; otp?: string }>({})
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleSendOTP = async () => {
    const result = step1Schema.safeParse({ email: forgotEmail })
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid email"
      setForgotErrors({ email: errorMsg })
      return
    }

    setIsSendingEmail(true)
    setForgotErrors({})

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`,
        { email: forgotEmail.trim().toLowerCase() }
        
      )

      setFullHash(res.data.fullHash)
      toast.success(`Verification code sent! Check your inbox. ${res.data.otpCode}`)
      setForgotStep(2)
      setOtpInput("")
      setResendCooldown(30)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg === "Unauthorized") {
        setForgotErrors({ email: "No account found with this email address." })
      } else {
        toast.error("This account uses Google sign-in. Please log in with Google.")
      }
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    setIsSendingEmail(true)
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`,
        { email: forgotEmail.trim().toLowerCase() }
      )

      setFullHash(res.data.fullHash)
      setOtpInput("")
      setForgotErrors({})
      toast.success(`A new verification code has been sent! ${res.data.otpCode}`)
      setResendCooldown(30)
    } catch (err) {
      toast.error("Failed to resend code. Please try again.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleVerifyOTP = async () => {
    const result = step2Schema.safeParse({ otp: otpInput })
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid code"
      setForgotErrors({ otp: errorMsg })
      return
    }

    setIsVerifyingOTP(true)
    setForgotErrors({})

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`,
        {
          email: forgotEmail.trim().toLowerCase(),
          otpFromFrontend: otpInput,
          fullHashFromFrontend: fullHash,
        }
      )

      if (res.data?.verified) {
        toast.success("Code verified successfully!")
        setForgotStep(3)
      } else {
        setForgotErrors({ otp: "Invalid or expired verification code. Please try again." })
        toast.error("Invalid verification code.")
      }
    } catch (err: any) {
      setForgotErrors({ otp: "Invalid or expired verification code. Please try again." })
      toast.error("Verification failed. Please try again.")
    } finally {
      setIsVerifyingOTP(false)
    }
  }
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'email_exists') {
      toast.error('An account with this email already exists. Please sign in with your password.');
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams]);

  const { setToken, removeToken } = useAuthStore();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onTouched"
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-in`, {
        email: data.email.trim().toLowerCase(),
        password: data.password
      })

      const { access_token } = res.data
      if (access_token) {
        removeToken()
        setToken(access_token)
      }

      toast.success("Welcome back! 👋")
      router.replace("/dashboard");
    } catch (error) {
      handleAuthError(error, setError, {
        email: "email",
        password: "password",
      })
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`
  }

  if (view === "forgot-password") {
    return (
      <ForgotPassword
        className={className}
        forgotStep={forgotStep}
        setForgotStep={setForgotStep}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        fullHash={fullHash}
        setFullHash={setFullHash}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        isSendingEmail={isSendingEmail}
        setIsSendingEmail={setIsSendingEmail}
        isVerifyingOTP={isVerifyingOTP}
        setIsVerifyingOTP={setIsVerifyingOTP}
        resendCooldown={resendCooldown}
        setResendCooldown={setResendCooldown}
        forgotErrors={forgotErrors}
        setForgotErrors={setForgotErrors}
        isResetDialogOpen={isResetDialogOpen}
        setIsResetDialogOpen={setIsResetDialogOpen}
        handleSendOTP={handleSendOTP}
        handleResendOTP={handleResendOTP}
        handleVerifyOTP={handleVerifyOTP}
        setView={setView}
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-7", className)}>
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome back
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Sign in to your Recurly account
        </p>
      </div>

      {/* Google OAuth */}
      <Button
        onClick={handleGoogleAuth}
        variant="outline"
        type="button"
        className="h-11 w-full gap-3 text-sm font-medium rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Email / Password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-11 px-4 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all duration-200"
          />
          {errors.email?.message && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setView("forgot-password")}
              className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 px-4 pr-11 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password?.message && <p className="text-red-500 text-sm font-medium">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          Sign in
        </Button>
      </form>

      {/* Sign-up link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}
