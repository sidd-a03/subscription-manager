import { cn } from '@/lib/utils'
import React from 'react'
import { Mail, KeyRound, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ResetPasswordDialog } from '@/components/reset-password-dialog'

interface ForgotPasswordProps {
  className?: string
  forgotStep: 1 | 2 | 3
  setForgotStep: (step: 1 | 2 | 3) => void
  forgotEmail: string
  setForgotEmail: (email: string) => void
  fullHash: string
  setFullHash: (hash: string) => void
  otpInput: string
  setOtpInput: (otp: string) => void
  isSendingEmail: boolean
  setIsSendingEmail: (sending: boolean) => void
  isVerifyingOTP: boolean
  setIsVerifyingOTP: (verifying: boolean) => void
  resendCooldown: number
  setResendCooldown: (cooldown: number) => void
  forgotErrors: { email?: string; otp?: string }
  setForgotErrors: React.Dispatch<React.SetStateAction<{ email?: string; otp?: string }>>
  isResetDialogOpen: boolean
  setIsResetDialogOpen: (open: boolean) => void
  handleSendOTP: () => void
  handleResendOTP: () => void
  handleVerifyOTP: () => void
  setView: (view: "signin" | "forgot-password") => void
}

const ForgotPassword = ({
  className,
  forgotStep,
  setForgotStep,
  forgotEmail,
  setForgotEmail,
  fullHash,
  setFullHash,
  otpInput,
  setOtpInput,
  isSendingEmail,
  setIsSendingEmail,
  isVerifyingOTP,
  setIsVerifyingOTP,
  resendCooldown,
  setResendCooldown,
  forgotErrors,
  setForgotErrors,
  isResetDialogOpen,
  setIsResetDialogOpen,
  handleSendOTP,
  handleResendOTP,
  handleVerifyOTP,
  setView,
}: ForgotPasswordProps) => {
  return (
    <>
      <div className={cn("flex flex-col gap-7", className)}>
        {/* Stepper progress indicator */}
        <div className="flex items-center justify-between w-full px-1 mb-2">
          {/* Step 1: Email */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={cn(
              "flex size-10 items-center justify-center rounded-full border transition-all duration-300",
              forgotStep === 1
                ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:border-teal-400 shadow-sm"
                : forgotStep > 1
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}>
              <Mail className="size-4" />
            </div>
            <span className={cn(
              "text-xs font-semibold tracking-wide transition-colors",
              forgotStep === 1
                ? "text-teal-600 dark:text-teal-400"
                : forgotStep > 1
                ? "text-slate-900 dark:text-slate-50"
                : "text-slate-400 dark:text-slate-500"
            )}>
              Email
            </span>
          </div>

          {/* Line 1 */}
          <div className={cn(
            "h-0.5 flex-1 -mt-5 transition-all duration-300",
            forgotStep > 1 ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-800"
          )} />

          {/* Step 2: Verification */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={cn(
              "flex size-10 items-center justify-center rounded-full border transition-all duration-300",
              forgotStep === 2
                ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:border-teal-400 shadow-sm"
                : forgotStep > 2
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}>
              <KeyRound className="size-4" />
            </div>
            <span className={cn(
              "text-xs font-semibold tracking-wide transition-colors",
              forgotStep === 2
                ? "text-teal-600 dark:text-teal-400"
                : forgotStep > 2
                ? "text-slate-900 dark:text-slate-50"
                : "text-slate-400 dark:text-slate-500"
            )}>
              Verify
            </span>
          </div>

          {/* Line 2 */}
          <div className={cn(
            "h-0.5 flex-1 -mt-5 transition-all duration-300",
            forgotStep > 2 ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-800"
          )} />

          {/* Step 3: Success */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={cn(
              "flex size-10 items-center justify-center rounded-full border transition-all duration-300",
              forgotStep === 3
                ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:border-teal-400 shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}>
              <CheckCircle2 className="size-4" />
            </div>
            <span className={cn(
              "text-xs font-semibold tracking-wide transition-colors",
              forgotStep === 3
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-400 dark:text-slate-500"
            )}>
              Done
            </span>
          </div>
        </div>

        {/* Step Forms */}
        {forgotStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your email address and we&apos;ll send you a 6-digit verification code.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value)
                  if (forgotErrors.email) {
                    setForgotErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                className="h-11 px-4 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all duration-200"
              />
              {forgotErrors.email && (
                <p className="text-red-500 text-sm font-medium">{forgotErrors.email}</p>
              )}
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={isSendingEmail}
              className="h-11 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer gap-2"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Verification Code
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setView("signin")
                setForgotStep(1)
                setForgotEmail("")
                setForgotErrors({})
              }}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer mt-1"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </button>
          </div>
        )}

        {forgotStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Check your email
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We sent a 6-digit verification code to <span className="font-semibold text-slate-900 dark:text-slate-100">{forgotEmail}</span>. Enter it below to verify.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 my-2">
              <label htmlFor="otp-input" className="sr-only">Verification Code</label>
              <InputOTP
                maxLength={6}
                value={otpInput}
                onChange={(value) => {
                  setOtpInput(value)
                  if (forgotErrors.otp) {
                    setForgotErrors((prev) => ({ ...prev, otp: undefined }))
                  }
                }}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                  <InputOTPSlot index={1} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                  <InputOTPSlot index={2} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                  <InputOTPSlot index={3} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                  <InputOTPSlot index={4} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                  <InputOTPSlot index={5} className="size-11 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 data-[active=true]:border-teal-500 data-[active=true]:ring-teal-500/30 data-[active=true]:ring-3 transition-all" />
                </InputOTPGroup>
              </InputOTP>
              {forgotErrors.otp && (
                <p className="text-red-500 text-sm font-medium text-center">{forgotErrors.otp}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP || otpInput.length < 6}
                className="h-11 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer gap-2 disabled:opacity-50"
              >
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1)
                    setOtpInput("")
                    setForgotErrors({})
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSendingEmail}
                  onClick={handleResendOTP}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors font-medium cursor-pointer",
                    resendCooldown > 0
                      ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  )}
                >
                  <RefreshCw className={cn("size-3.5", resendCooldown === 0 && "hover:rotate-180 transition-transform duration-500", isSendingEmail && "animate-spin")} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {forgotStep === 3 && (
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 animate-bounce">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Verification Successful!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Your email <span className="font-semibold text-slate-900 dark:text-slate-100">{forgotEmail}</span> has been verified. Set a new password to regain access.
              </p>
            </div>

   
            <Button
              onClick={() => setIsResetDialogOpen(true)}
              className="h-11 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              Reset Password
            </Button>

            <button
              type="button"
              onClick={() => {
                setView("signin")
                setForgotStep(1)
                setForgotEmail("")
                setFullHash("")
                setOtpInput("")
                setForgotErrors({})
                setIsResetDialogOpen(false)
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>

      <ResetPasswordDialog
        open={isResetDialogOpen}
        email={forgotEmail}
        onSubmit={async (newPassword) => {
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
            email: forgotEmail,
            otpCode: otpInput,
            newPassword,
            fullHash,
          })
          toast.success("Password reset successfully! Please sign in.")
          setIsResetDialogOpen(false)
          setView("signin")
          setForgotStep(1)
          setForgotEmail("")
          setFullHash("")
          setOtpInput("")
          setForgotErrors({})
        }}
        onClose={() => setIsResetDialogOpen(false)}
      />
    </>
  )
}

export default ForgotPassword