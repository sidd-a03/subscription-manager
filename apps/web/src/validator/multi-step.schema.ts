import { verifyOtpSchema } from "@repo/dto";
import * as z from "zod";

export const step1Schema = z.object({
  email: z.email({
    message: "Please enter a valid email",
  }),
});


export const step2Schema = z.object({
  otp: verifyOtpSchema.shape.otpCode,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;