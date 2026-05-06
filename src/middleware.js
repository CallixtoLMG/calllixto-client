import { PAGES } from "@/common/constants";
import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_PAGE } from "./common/constants/maintenance";

const TOKEN_KEY = "token";
const SESSION_ENDED_NOTIFICATION_KEY = "sessionEndedNotification";

const PUBLIC_ROUTES_WHEN_AVAILABLE = [
  PAGES.BASE,
  PAGES.LOGIN.BASE,
  PAGES.RESTORE_PASSWORD.BASE,
  PAGES.CHANGE_PASSWORD.BASE,
  MAINTENANCE_PAGE.BASE,
];

const isPublicRoute = (pathname) => PUBLIC_ROUTES_WHEN_AVAILABLE.includes(pathname);

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
    const response = NextResponse.redirect(new URL(PAGES.LOGIN.BASE, request.url));
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
