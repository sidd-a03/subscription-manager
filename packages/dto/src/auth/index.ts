import * as z from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),

  avatarUrl: z
    .url("Avatar must be a valid URL")
    .optional(),
});

export type SignUpDto = z.infer<typeof signUpSchema>;


export const signInSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type SignInDto = z.infer<typeof signInSchema>;


export const forgotPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address"),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 characters"),

  fullHash: z
    .string()
    .min(1, "Verification hash cannot be empty"),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 characters"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),

  fullHash: z
    .string()
    .min(1, "Verification hash cannot be empty"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const authResponseSchema = z.object({
  access_token: z.string(),
});

export const mobileAuthResponseSchema = authResponseSchema.extend({
  refresh_token: z.string(),
});

export type AuthResponseDto = z.infer<typeof authResponseSchema>;
export type MobileAuthResponseDto = z.infer<typeof mobileAuthResponseSchema>;
