import { verifyOtpSchema } from "@repo/dto";
import { z } from "zod";

// Step 1: email collection — reuse the shared forgotPasswordSchema shape
export const step1Schema = z.object({
  email: z.string().email({
    message: "Please enter a valid email",
  }),
});

// Step 2: OTP verification — reuse the shared verifyOtpSchema's otpCode field
export const step2Schema = z.object({
  otp: verifyOtpSchema.shape.otpCode,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;