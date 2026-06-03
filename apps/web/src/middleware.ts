import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/signin", "/signup"]
const PROTECTED_ROUTES = ["/dashboard"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if the refresh_token cookie is present (set httpOnly by the backend)
  const hasRefreshToken = req.cookies.has("refresh_token")

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  // Already logged in → redirect away from signin/signup to dashboard
  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Not logged in → redirect to signin from protected pages
  if (isProtectedRoute && !hasRefreshToken) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - api routes (so the backend proxy/API routes still work)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
