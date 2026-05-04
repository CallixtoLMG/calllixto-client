import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_PAGE, MAINTENANCE_PUBLIC_PATHS } from "./common/constants/maintenance";

const isPublicMaintenancePath = (pathname) =>
  MAINTENANCE_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!MAINTENANCE_MODE || isPublicMaintenancePath(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = MAINTENANCE_PAGE.BASE;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
