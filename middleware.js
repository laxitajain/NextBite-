import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;
  const protectedRoute =
    pathname.startsWith("/donor") ||
    pathname.startsWith("/recipient") ||
    pathname.startsWith("/notifications");

  if (protectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname === "/join")) {
    return NextResponse.redirect(new URL(`/${token.role}`, request.url));
  }

  if (token && pathname.startsWith("/donor") && token.role !== "donor") {
    return NextResponse.redirect(new URL(`/${token.role}`, request.url));
  }

  if (
    token &&
    pathname.startsWith("/recipient") &&
    token.role !== "recipient"
  ) {
    return NextResponse.redirect(new URL(`/${token.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/donor/:path*",
    "/recipient/:path*",
    "/notifications/:path*",
    "/login",
    "/join",
  ],
};
