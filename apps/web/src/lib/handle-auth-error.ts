import axios from "axios"
import toast from "react-hot-toast"
import type { UseFormSetError, FieldValues, Path } from "react-hook-form"

/**
 * Maps a single backend message to a specific form field key based on keywords.
 * Returns the field name if matched, or null if it should be treated as a toast.
 */
function resolveField<T extends FieldValues>(
  msg: string,
  fieldMap: Partial<Record<string, Path<T>>>
): Path<T> | null {
  const lower = msg.toLowerCase()
  for (const [keyword, field] of Object.entries(fieldMap)) {
    if (lower.includes(keyword)) return field as Path<T>
  }
  return null
}

/**
 * Handles Axios errors from NestJS auth endpoints.
 *
 * NestJS ValidationPipe emits:  { message: string[], statusCode: 400 }
 * NestJS exception classes emit: { message: string,   statusCode: 4xx }
 *
 * Field-specific messages are routed to setError() so they appear under the
 * relevant input. Everything else pops a toast so the user always gets feedback.
 *
 * @param error      The caught error (unknown)
 * @param setError   React Hook Form's setError bound to the current form
 * @param fieldMap   Maps lowercase keyword → form field name, e.g. { email: "email", password: "password" }
 */
export function handleAuthError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, Path<T>>>
): void {
  if (!axios.isAxiosError(error)) {
    toast.error("Network error. Please check your connection.")
    return
  }

  const errData = error.response?.data

  // Normalise to a string array regardless of whether backend sent string | string[]
  const messages: string[] = Array.isArray(errData?.message)
    ? errData.message
    : errData?.message
      ? [errData.message]
      : ["Something went wrong. Please try again."]

  messages.forEach((msg: string) => {
    const field = resolveField<T>(msg, fieldMap)
    if (field) {
      setError(field, { type: "server", message: msg })
    } else {
      toast.error(msg)
    }
  })
}
