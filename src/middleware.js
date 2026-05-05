import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_PAGE } from "./common/constants/maintenance";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!MAINTENANCE_MODE || pathname === MAINTENANCE_PAGE.BASE) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = MAINTENANCE_PAGE.BASE;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
