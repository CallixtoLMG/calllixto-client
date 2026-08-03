import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_PAGE } from "./common/constants/maintenance";
import { CHANGE_PASSWORD_PAGE, LOGIN_PAGE, PUBLIC_BUDGETS_PAGE, RESTORE_PASSWORD_PAGE } from "./common/constants/routes";
import { SESSION_ENDED_NOTIFICATION_KEY, TOKEN_KEY } from "./common/constants/session";

const PUBLIC_ROUTES_WHEN_AVAILABLE = [
  LOGIN_PAGE,
  RESTORE_PASSWORD_PAGE,
  CHANGE_PASSWORD_PAGE,
  MAINTENANCE_PAGE.BASE,
];

const isPublicBudgetRoute = (pathname) => {
  const prefix = `${PUBLIC_BUDGETS_PAGE}/`;

  if (!pathname.startsWith(prefix)) return false;

  const segments = pathname.slice(prefix.length).split("/");
  return segments.length === 2 && segments.every(Boolean);
};

const isPublicRoute = (pathname) =>
  PUBLIC_ROUTES_WHEN_AVAILABLE.includes(pathname) ||
  isPublicBudgetRoute(pathname);

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
