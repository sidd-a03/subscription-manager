import * as z from "zod";

export const step1Schema = z.object({
    email: z.email({
        message: "Please enter a valid email"
    })
})

export const step2Schema = z.object({
    otp: z.string().length(6, {
        message: "Verification code must be exactly 6 digits"
    })
})