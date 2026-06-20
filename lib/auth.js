import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function getRequestUser(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) return null;

  return {
    id: String(token.id),
    email: token.email,
    name: token.name,
    role: token.role,
  };
}

export function authError(status = 401) {
  return NextResponse.json(
    {
      success: false,
      message: status === 403 ? "You do not have permission to do that" : "Please log in to continue",
    },
    { status }
  );
}

export function hasRole(user, ...roles) {
  return Boolean(user && roles.includes(user.role));
}

export function owns(user, ownerId) {
  return Boolean(user?.id && ownerId && user.id === String(ownerId));
}
