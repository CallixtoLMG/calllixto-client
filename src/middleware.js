import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_PAGE } from "./common/constants/maintenance";

const TOKEN_KEY = "token";
const SESSION_ENDED_NOTIFICATION_KEY = "sessionEndedNotification";
const LOGIN_PAGE = "/login";

const PUBLIC_ROUTES_WHEN_AVAILABLE = [
  LOGIN_PAGE,
  "/recuperar-contrasena",
  "/cambiar-contrasena",
  MAINTENANCE_PAGE.BASE,
];

const PUBLIC_ROUTE_PREFIXES_WHEN_AVAILABLE = [
  "/presupuestos",
];

const isPublicRoute = (pathname) =>
  PUBLIC_ROUTES_WHEN_AVAILABLE.includes(pathname) ||
  PUBLIC_ROUTE_PREFIXES_WHEN_AVAILABLE.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE_MODE) {
    if (pathname === MAINTENANCE_PAGE.BASE) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(MAINTENANCE_PAGE.BASE, request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.get(TOKEN_KEY)?.value) {
    const response = NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
    response.cookies.set(SESSION_ENDED_NOTIFICATION_KEY, "true", {
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
