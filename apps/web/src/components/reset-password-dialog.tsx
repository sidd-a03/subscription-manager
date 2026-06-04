"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[\!@#\$%\^&\*\(\)\-_\+=\[\]\{\};':",\./<>\?\|\\]/, { message: "Must contain at least one special character" }),
    confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetFormValues = z.infer<typeof resetSchema>

interface ResetPasswordDialogProps {
  open: boolean
  email: string
  onSubmit: (newPassword: string) => Promise<void>;
  onClose: () => void
}

export function ResetPasswordDialog({
  open,
  email,
  onSubmit,
  onClose,
}: ResetPasswordDialogProps) {
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  })

  const newPasswordValue = watch("newPassword", "")

  // Password strength indicator
  const strength = {
    length: newPasswordValue.length >= 8,
    upper: /[A-Z]/.test(newPasswordValue),
    number: /[0-9]/.test(newPasswordValue),
  }
  const strengthScore = Object.values(strength).filter(Boolean).length

  const handleFormSubmit: SubmitHandler<ResetFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data.newPassword)
      reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-0 overflow-hidden">
        {/* Decorative header band */}
        <div className="h-1.5 w-full bg-linear-to-r from-teal-400 via-teal-500 to-teal-600" />

        <div className="px-7 pt-5 pb-7 flex flex-col gap-6">
          <DialogHeader className="text-left gap-2">
            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-500/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 mb-1">
              <KeyRound className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Set a new password
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Creating a new password for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                New password
              </label>
              <div className="relative">
                <Input
                  {...register("newPassword")}
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-11 px-4 pr-11 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm font-medium">{errors.newPassword.message}</p>
              )}

              {/* Strength indicator — only shown when the user is typing */}
              {newPasswordValue.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i < strengthScore
                            ? strengthScore === 1
                              ? "bg-red-400"
                              : strengthScore === 2
                              ? "bg-amber-400"
                              : "bg-teal-500"
                            : "bg-slate-200 dark:bg-slate-800"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className={cn(strength.length && "text-teal-600 dark:text-teal-400 font-medium")}>
                      8+ chars
                    </span>
                    <span className={cn(strength.upper && "text-teal-600 dark:text-teal-400 font-medium")}>
                      Uppercase
                    </span>
                    <span className={cn(strength.number && "text-teal-600 dark:text-teal-400 font-medium")}>
                      Number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm new password
              </label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-11 px-4 pr-11 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Save new password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="h-10 w-full rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
